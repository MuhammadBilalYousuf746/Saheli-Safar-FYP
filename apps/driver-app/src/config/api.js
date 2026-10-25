import { Platform } from "react-native";
import Constants from "expo-constants";

const API_PORT = 5000;

// Backend URL resolution:
// 1. EXPO_PUBLIC_API_URL in apps/driver-app/.env (if set).
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

// Shared API request function for the Driver App.
export const apiRequest = async (
  endpoint,
  { method = "GET", body, token } = {}
) => {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error(
      "Unable to connect to Saheli Safar server. Check your network connection."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Show the first field error from backend validation, if any.
    const error = new Error(
      data.errors?.[0]?.message ||
        data.message ||
        "Something went wrong. Please try again."
    );

    error.status = response.status;
    error.details = data.errors;

    throw error;
  }

  return data;
};

export { API_BASE_URL };
