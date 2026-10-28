import { useMemo } from "react";

import { useAuth } from "../../auth/context/AuthContext";

export const useUserApi = () => {
  const { request } = useAuth();

  return useMemo(
    () => ({
      // PATCH /api/admin/users/:userId/status
      updateUserStatus: (userId, status) =>
        request(`/admin/users/${userId}/status`, {
          method: "PATCH",
          body: { status },
        }),
    }),
    [request]
  );
};
