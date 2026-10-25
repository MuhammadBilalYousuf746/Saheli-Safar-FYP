
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
        getItem: async (key) => {
          try {
            return window.sessionStorage.getItem(key);
          } catch {
            return null;
          }
        },
        setItem: async (key, value) => {
          window.sessionStorage.setItem(key, value);
        },
        deleteItem: async (key) => {
          try {
            window.sessionStorage.removeItem(key);
          } catch {
            // Storage unavailable: nothing to delete.
          }
        },
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
const SESSION_LIFETIME_MS = 14 * 60 * 1000;

// ==========================================
// STEP 1: SAVE PASSENGER SESSION
// ==========================================
export const savePassengerSession = async ({
  accessToken,
  user,
}) => {
  if (
    typeof accessToken !== "string" ||
    !accessToken.trim()
  ) {
    throw new Error("A valid access token is required.");
  }

  if (
    !user ||
    user.role !== "passenger" ||
    user.status !== "active"
  ) {
    throw new Error("Invalid passenger session.");
  }

  const session = {
    accessToken,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    },
    expiresAt: Date.now() + SESSION_LIFETIME_MS,
  };

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
    await storage.deleteItem(SESSION_KEY);
    return null;
  }

  const isValid =
    typeof session?.accessToken === "string" &&
    session.accessToken.length > 0 &&
    session.user?.role === "passenger" &&
    session.user?.status === "active" &&
    typeof session.expiresAt === "number" &&
    Date.now() < session.expiresAt;

  if (!isValid) {
    await storage.deleteItem(SESSION_KEY);
    return null;
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
