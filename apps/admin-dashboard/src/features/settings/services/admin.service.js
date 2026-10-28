import { useMemo } from "react";

import { useAuth } from "../../auth/context/AuthContext";

export const useSettingsApi = () => {
  const { request } = useAuth();

  return useMemo(
    () => ({
      // GET /api/admin/admins?page=&limit=
      listAdmins: (query) => request("/admin/admins", { query }),

      // PATCH /api/admin/profile/email
      updateOwnAdminEmail: (payload) =>
        request("/admin/profile/email", {
          method: "PATCH",
          body: payload,
        }),

      // POST /api/admin/profile/email/resend
      resendOwnAdminEmailVerification: () =>
        request("/admin/profile/email/resend", {
          method: "POST",
          body: {},
        }),

      // DELETE /api/admin/profile/me
      deactivateOwnAdmin: (payload) =>
        request("/admin/profile/me", {
          method: "DELETE",
          body: payload,
        }),

      // POST /api/admin/admins
      createAdmin: (payload) =>
        request("/admin/admins", {
          method: "POST",
          body: payload,
        }),

      // PATCH /api/admin/admins/:userId/access
      updateAdminAccess: (userId, accessLevel) =>
        request(`/admin/admins/${userId}/access`, {
          method: "PATCH",
          body: { accessLevel },
        }),

      // PATCH /api/admin/admins/:userId/email
      updateAdminEmail: (userId, { email, password }) =>
        request(`/admin/admins/${userId}/email`, {
          method: "PATCH",
          body: { email, password },
        }),

      // DELETE /api/admin/admins/:userId
      deactivateAdmin: (userId, payload) =>
        request(`/admin/admins/${userId}`, {
          method: "DELETE",
          body: payload,
        }),

      // POST /api/admin/auth/change-password
      changePassword: (payload) =>
        request("/admin/auth/change-password", {
          method: "POST",
          body: payload,
        }),
    }),
    [request]
  );
};
