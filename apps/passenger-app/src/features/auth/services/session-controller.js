import { eligibleSession, sessionFromLogin, sessionExpiration } from './session-policy';

// Generation guards async results; the storage queue keeps writes/deletes ordered.
export function createSessionController({ storage, login, profile, onChange }) {
  let generation = 0;
  let pendingLogin = null;
  let state = { status: 'initializing', session: null, message: '' };
  let writes = Promise.resolve();
  const emit = (next, source) => { state = next; onChange(state, source); };
  const persist = operation => {
    const result = writes.catch(() => {}).then(operation);
    writes = result;
    return result;
  };
  const clear = async (status = 'unauthenticated', message = '') => {
    const version = ++generation;
    emit({ status, session: null, message, showLogin: true, sessionEventId: version });
    try { await persist(storage.clear); return true; }
    catch { if (version === generation) emit({ status: 'unavailable', session: null,
      message: 'Unable to remove the saved session. Retry before leaving the app.', clearing: true }); return false; }
  };
  const capture = () => state.status === 'authenticated' && eligibleSession(state.session)
    ? { ...state.session, generation } : null;
  const reject = (identity, message = 'Your session has expired. Please sign in again.') => {
    if (identity.generation === generation && identity.accessToken === state.session?.accessToken) {
      void clear('expired', message);
    }
  };
  const restore = async ({ background = false } = {}) => {
    const version = ++generation;
    // Native camera/gallery returns trigger AppState.active. Keep the existing
    // protected navigator mounted during that revalidation so picker results
    // are not discarded. Expiry/revocation and failed validation still apply.
    if (!background || state.status !== 'authenticated') emit({ status: 'initializing', session: null, message: '' });
    try {
      await writes.catch(() => {});
      const saved = await storage.read();
      const session = saved ? { ...saved, expiresAt: sessionExpiration(saved) } : null;
      if (version !== generation) return;
      if (!session) { emit({ status: 'unauthenticated', session: null, message: '' }); return; }
      if (!eligibleSession(session)) { await clear('expired', 'Your session has expired. Please sign in again.'); return; }
      const result = await profile(session.accessToken);
      if (version !== generation) return;
      if (!eligibleSession({ ...session, user: result.user }) || result.success !== true) {
        await clear('expired', 'This Passenger session is no longer valid. Please sign in again.'); return;
      }
      emit({ status: 'authenticated', session: { ...session, user: result.user }, message: '' });
    } catch (error) {
      if (version !== generation) return;
      if ([401, 403, 404].includes(error.status)) {
        await clear('expired', error.status === 401 ? 'Your session has expired. Please sign in again.' : error.message);
      } else emit({ status: 'unavailable', session: null,
        message: 'Unable to validate your session. Check your connection and retry.' });
    }
  };
  const signIn = async credentials => {
    const version = ++generation;
    pendingLogin = version;
    try {
      const response = await login(credentials);
      if (version !== generation) return false;
      const candidate = sessionFromLogin(response);
      const session = await persist(() => storage.save({ ...candidate, expiresInSeconds: response.expiresInSeconds }));
      if (version !== generation) return false;
      if (!eligibleSession(session)) { await clear('expired', 'Your session has expired. Please sign in again.'); return false; }
      // A presentation event accompanies an already validated, saved login.
      // Restoration and profile changes do not emit this event.
      emit({ status: 'authenticated', session, message: '' }, 'sign-in');
      return true;
    } catch (error) {
      if (version !== generation) return false;
      throw error;
    } finally {
      if (pendingLogin === version) pendingLogin = null;
    }
  };
  const updatePassengerName = (owner, fullName) => {
    if (state.status !== 'authenticated' || state.session !== owner || !eligibleSession(owner) ||
        typeof fullName !== 'string' || fullName.trim().length < 2 || fullName.trim().length > 80) return null;
    const session = { ...owner, user: { ...owner.user, fullName: fullName.trim() } };
    emit({ ...state, session });
    return session;
  };
  return { restore, signIn, logout: () => clear(), capture, reject, updatePassengerName,
    isCurrentSession: owner => state.status === 'authenticated' && state.session === owner && eligibleSession(owner),
    cancelSignIn: () => { if (pendingLogin === generation) { pendingLogin = null; void clear(); } },
    expire: () => { if (state.session && !eligibleSession(state.session)) void clear('expired', 'Your session has expired. Please sign in again.'); },
    cancel: () => { generation++; }, getState: () => state };
}
