import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'expo-router';
import { requestPassengerReset, verifyPassengerReset, resetPassengerPassword } from '../services/passenger-auth.api';

const Context = createContext(null);
const recoveryPaths = new Set(['/forgot-password', '/verify-reset-otp', '/new-password']);
export const useRecoveryFlow = () => useContext(Context);
export const recoveryErrorMessage = error => error.details?.length
  ? error.details.map(detail => `${detail.field}: ${detail.message}`).join('\n')
  : error.message || 'Unable to complete recovery. Please retry.';

export function RecoveryFlowProvider({ children }) {
  const [recovery, setRecovery] = useState({});
  const [busy, setBusy] = useState(false);
  const generation = useRef(0);
  const locked = useRef(false);
  const pathname = usePathname();
  const clear = useCallback(() => {
    generation.current++;
    locked.current = false;
    setBusy(false);
    setRecovery({});
  }, []);
  useEffect(() => { if (!recoveryPaths.has(pathname)) clear(); }, [pathname, clear]);
  useEffect(() => {
    if (!recovery.resetToken) return;
    const timer = setTimeout(() => setRecovery(current => Date.now() >= current.grantExpiresAt
      ? { ...current, resetToken: null } : current),
      Math.max(0, recovery.grantExpiresAt - Date.now()));
    return () => clearTimeout(timer);
  }, [recovery.resetToken, recovery.grantExpiresAt]);
  const run = async action => {
    if (locked.current) return false;
    locked.current = true;
    setBusy(true);
    const version = ++generation.current;
    const current = () => version === generation.current;
    try { return await action(current); }
    catch (error) { if (current()) throw error; return false; }
    finally { if (current()) { locked.current = false; setBusy(false); } }
  };
  const request = email => run(async current => {
    const response = await requestPassengerReset(email);
    if (!current()) return false;
    if (!response.success) throw new Error('Unable to request a reset code. Please retry.');
    setRecovery({ email, codeExpiresAt: Date.now() + response.expiresInSeconds * 1000,
      retryAt: Date.now() + response.retryAfterSeconds * 1000, message: response.message });
    return true;
  });
  const verify = otp => run(async current => {
    if (!recovery.email) throw new Error('Start password recovery again.');
    const response = await verifyPassengerReset(recovery.email, otp);
    if (!current()) return false;
    if (!response.success || !/^[A-Za-z0-9_-]{43}$/.test(response.resetToken)) throw new Error('Unable to verify the reset code. Please retry.');
    setRecovery(previous => ({ ...previous, resetToken: response.resetToken,
      grantExpiresAt: Date.now() + response.expiresInSeconds * 1000 }));
    return true;
  });
  const reset = (password, confirmation) => run(async current => {
    if (!recovery.resetToken || Date.now() >= recovery.grantExpiresAt) throw new Error('Your reset authorization expired. Request a new code.');
    const response = await resetPassengerPassword(recovery.resetToken, password, confirmation);
    if (!current()) return false;
    if (!response.success) throw new Error('Unable to reset your password. Please retry.');
    clear();
    return true;
  });
  return <Context.Provider value={{ recovery, busy, clear, request, verify, reset }}>{children}</Context.Provider>;
}
