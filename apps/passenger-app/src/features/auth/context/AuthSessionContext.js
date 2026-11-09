import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, Keyboard } from 'react-native';
import { apiRequest, setAuthenticationBridge } from '../../../config/api';
import { getPassengerSession, savePassengerSession, clearPassengerSession } from '../services/auth-session';
import { loginPassenger } from '../services/passenger-auth.api';
import { createSessionController } from '../services/session-controller';
import { notifications } from '../../../notifications/notification-store';
import { createLoginEntrance } from '../../../navigation/login-entrance';

const AuthSessionContext = createContext(null);
export const useAuthSession = () => useContext(AuthSessionContext);

export function AuthSessionProvider({ children }) {
  const [state, setState] = useState({ status: 'initializing', session: null, message: '' });
  const published = useRef(state), handledExpiry = useRef(null);
  const [homeEntrance] = useState(createLoginEntrance);
  const [controller] = useState(() => createSessionController({
    storage: { read: getPassengerSession, save: savePassengerSession, clear: clearPassengerSession },
    login: loginPassenger,
    profile: token => apiRequest('/passenger/profile/me', { token }),
    onChange: (next, source) => {
      homeEntrance.observe(next, source);
      if (next.status === 'expired' && handledExpiry.current !== next.sessionEventId) {
        handledExpiry.current = next.sessionEventId;
        Keyboard.dismiss(); notifications.clear();
        notifications.notify({ type: 'warning', title: 'Session Expired', primaryText: 'Sign In Again', message: next.message || 'Your session has expired. Please sign in again.', key: `session-expiry-${next.sessionEventId}` });
      } else if (published.current.status === 'authenticated' && next.status !== 'authenticated') {
        Keyboard.dismiss(); notifications.clear();
      }
      published.current = next; setState(next);
    },
  }));
  useEffect(() => {
    setAuthenticationBridge(controller);
    void controller.restore();
    const subscription = AppState.addEventListener('change', next => {
      if (next === 'active') {
        controller.expire();
        if (controller.capture()) void controller.restore({ background: true });
      }
    });
    return () => { controller.cancel(); setAuthenticationBridge(null); subscription.remove(); };
  }, [controller]);
  useEffect(() => {
    if (!state.session) return;
    const timer = setTimeout(controller.expire, Math.max(0, state.session.expiresAt - Date.now()));
    return () => clearTimeout(timer);
  }, [controller, state.session]);
  const logout = async () => {
    const cleared = await controller.logout();
    return cleared;
  };
  const confirmLogout = () => notifications.confirm({ title: 'Log out?', message: 'You will need to sign in again to access your Passenger account.', primaryText: 'Log out', secondaryText: 'Stay signed in', onConfirm: logout });
  return <AuthSessionContext.Provider value={{ ...state, signIn: controller.signIn,
    peekHomeEntrance: homeEntrance.peek, consumeHomeEntrance: homeEntrance.consume,
    cancelSignIn: controller.cancelSignIn,
    updatePassengerName: controller.updatePassengerName,
    logout, confirmLogout, retry: state.clearing ? controller.logout : controller.restore }}>{children}</AuthSessionContext.Provider>;
}
