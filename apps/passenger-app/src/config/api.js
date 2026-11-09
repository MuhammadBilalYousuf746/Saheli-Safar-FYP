
import { Platform } from "react-native";
import Constants from "expo-constants";
import { fetch as expoFetch } from "expo/fetch";

const API_PORT = 5000;

// Backend URL resolution:
// 1. EXPO_PUBLIC_API_URL in apps/passenger-app/.env (if set).
// 2. Web: the same host the page was opened from (e.g. localhost).
// 3. Phone/emulator: the computer running "expo start". Expo knows its
//    current Wi-Fi IP, so this keeps working when the IP changes.
const resolveApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === "web" && typeof window !== "undefined") {
    return `http://${window.location.hostname}:${API_PORT}/api`;
  }

  // e.g. "192.168.18.37:8081"
  const devServerHost = Constants.expoConfig?.hostUri?.split(":")[0];

  if (devServerHost) {
    return `http://${devServerHost}:${API_PORT}/api`;
  }

  return `http://localhost:${API_PORT}/api`;
};

const API_BASE_URL = resolveApiBaseUrl();

let authBridge;
export const setAuthenticationBridge = bridge => { authBridge = bridge; };

// Shared API request function for the Passenger App.
export const apiRequest = async (
  endpoint,
  { method = "GET", body, token, authenticated = false, expectedSession, multipart = false, responseType = "json", requireHttps = false } = {}
) => {
  if (requireHttps && process.env.NODE_ENV === "production" && !API_BASE_URL.startsWith("https://")) throw new Error("A secure HTTPS connection is required for identity documents.");
  if (expectedSession !== undefined && !authBridge?.isCurrentSession?.(expectedSession)) {
    throw new Error("Your session changed. Reopen your profile before saving.");
  }
  const current = authBridge?.capture();
  const identity = authenticated || (token && token === current?.accessToken) ? current : null;
  if (authenticated && !identity) {
    authBridge?.expire();
    throw new Error("Please sign in again.");
  }
  const requestToken = authenticated ? identity.accessToken : token;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), multipart ? 90000 : 15000);
  try {
    const requestFetch = multipart && Platform.OS !== "web" ? expoFetch : fetch;
    const response = await requestFetch(`${API_BASE_URL}${endpoint}`, {
      method,
      signal: controller.signal,
      headers: {
        ...(!multipart ? { "Content-Type": "application/json" } : {}),
        ...(requestToken ? { Authorization: `Bearer ${requestToken}` } : {}),
      },
      ...(body !== undefined
        ? { body: multipart ? body : JSON.stringify(body) }
        : {}),
    });

    if (response.ok && responseType === "blob") return await response.blob();
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(
        data.message || "Something went wrong. Please try again."
      );

      error.status = response.status;
      if (identity && response.status === 401) authBridge?.reject(identity);
      if (identity && response.status === 403 && data.message === "Your account is not active.") {
        authBridge?.reject(identity, data.message);
      }
      error.details = data.errors;

      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") throw new Error("The server took too long to respond. Please retry.");
    if (error instanceof TypeError) {
      throw new Error(
        "Unable to connect to Saheli Safar server. Check your network connection."
      );
    }

    throw error;
  } finally { clearTimeout(timeout); }
};

export { API_BASE_URL };
