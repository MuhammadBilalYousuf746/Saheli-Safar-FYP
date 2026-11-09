import React, { createContext, useContext, useMemo, useState } from "react";

const RegistrationFlowContext = createContext(null);

// Transient onboarding details must never enter URLs or persisted router state.
// Reloading the app intentionally requires restarting email verification.
export function RegistrationFlowProvider({ children }) {
  const [registration, setRegistration] = useState({});
  const value = useMemo(() => ({ registration, setRegistration }), [registration]);
  return (
    <RegistrationFlowContext.Provider value={value}>
      {children}
    </RegistrationFlowContext.Provider>
  );
}

export function useRegistrationFlow() {
  const value = useContext(RegistrationFlowContext);
  if (!value) throw new Error("RegistrationFlowProvider is required.");
  return value;
}
