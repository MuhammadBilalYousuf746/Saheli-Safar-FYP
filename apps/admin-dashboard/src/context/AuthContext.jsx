import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { apiRequest } from "../config/api";

const TOKEN_KEY = "saheli_admin_token";

const AuthContext = createContext(null);

const readToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const writeToken = (token) => {
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Storage unavailable: the session lasts until page reload.
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(readToken);
  const [admin, setAdmin] = useState(null);
  const [isRestoring, setIsRestoring] = useState(Boolean(readToken()));

  const logout = useCallback(() => {
    writeToken(null);
    setToken(null);
    setAdmin(null);
  }, []);

  // Authenticated request. Expired or revoked sessions log out.
  const request = useCallback(
    async (endpoint, options = {}) => {
      try {
        return await apiRequest(endpoint, { ...options, token });
      } catch (error) {
        if (error.status === 401) {
          logout();
        }

        throw error;
      }
    },
    [token, logout]
  );

  const login = useCallback(async ({ email, password }) => {
    const data = await apiRequest("/admin/auth/login", {
      method: "POST",
      body: { email, password },
    });

    writeToken(data.accessToken);
    setToken(data.accessToken);
    setAdmin(data.user);
  }, []);

  // Restore the admin session after a page reload.
  useEffect(() => {
    if (!token || admin) {
      setIsRestoring(false);
      return;
    }

    let cancelled = false;

    apiRequest("/admin/profile/me", { token })
      .then((data) => {
        if (!cancelled) setAdmin(data.user);
      })
      .catch(() => {
        if (!cancelled) logout();
      })
      .finally(() => {
        if (!cancelled) setIsRestoring(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, admin, logout]);

  const value = useMemo(
    () => ({
      admin,
      isAuthenticated: Boolean(token && admin),
      isRestoring,
      login,
      logout,
      request,
    }),
    [admin, token, isRestoring, login, logout, request]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
};
