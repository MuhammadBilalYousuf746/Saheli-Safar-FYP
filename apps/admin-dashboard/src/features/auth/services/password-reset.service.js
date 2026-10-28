import { apiRequest } from "../../../shared/api/api";

export const requestPasswordReset = (email) =>
  apiRequest("/admin/auth/forgot-password", {
    method: "POST",
    body: { email },
  });

export const resetPassword = (payload) =>
  apiRequest("/admin/auth/reset-password", {
    method: "POST",
    body: payload,
  });
