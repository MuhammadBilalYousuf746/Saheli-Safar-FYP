
import { eligibleSession, sessionFromLogin } from "./session-policy";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// ==========================================
// SAHELI SAFAR - PASSENGER SESSION MANAGER
// ==========================================

// expo-secure-store only works on Android and iOS.
// On web, use the browser's sessionStorage instead
// (cleared when the tab is closed).
const storage =
  Platform.OS === "web"
    ? {
        getItem: async (key) => window.sessionStorage.getItem(key),
        setItem: async (key, value) => {
          window.sessionStorage.setItem(key, value);
        },
        deleteItem: async (key) => window.sessionStorage.removeItem(key),
      }
    : {
        getItem: (key) => SecureStore.getItemAsync(key),
        setItem: (key, value) => SecureStore.setItemAsync(key, value),
        deleteItem: (key) => SecureStore.deleteItemAsync(key),
      };

// Storage key for passenger authentication.
const SESSION_KEY = "saheli_safar_passenger_session";

// Backend currently generates a 15-minute Access JWT.
// Use a slightly shorter local lifetime.


// ==========================================
// STEP 1: SAVE PASSENGER SESSION
// ==========================================
export const savePassengerSession = async ({
  accessToken,
  user,
  expiresInSeconds,
}) => {
  const session = sessionFromLogin({ success: true, accessToken, user, expiresInSeconds });

  await storage.setItem(
    SESSION_KEY,
    JSON.stringify(session)
  );

  return session;
};

// ==========================================
// STEP 2: GET SAVED PASSENGER SESSION
// ==========================================
export const getPassengerSession = async () => {
  const storedSession = await storage.getItem(
    SESSION_KEY
  );

  if (!storedSession) {
    return null;
  }

  let session;

  try {
    session = JSON.parse(storedSession);
  } catch {
    throw Object.assign(new Error("Invalid saved session."), { status: 401 });
  }

  const isValid = eligibleSession(session);

  if (!isValid) {
    throw Object.assign(new Error("Invalid or expired saved session."), { status: 401 });
  }

  return session;
};

// ==========================================
// STEP 3: GET ACCESS TOKEN
// ==========================================
export const getPassengerAccessToken = async () => {
  const session = await getPassengerSession();

  return session?.accessToken || null;
};

// ==========================================
// STEP 4: CLEAR SESSION / LOGOUT
// ==========================================
export const clearPassengerSession = async () => {
  await storage.deleteItem(SESSION_KEY);
};

// ==========================================
// STEP 5: CHECK LOCAL SESSION
// ==========================================
export const hasPassengerSession = async () => {
  const session = await getPassengerSession();

  return Boolean(session);
};
