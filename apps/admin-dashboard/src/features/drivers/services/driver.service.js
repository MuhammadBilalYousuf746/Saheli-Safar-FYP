import { useMemo } from "react";

import { useAuth } from "../../auth/context/AuthContext";

export const useDriverApi = () => {
  const { request } = useAuth();

  return useMemo(
    () => ({
      // GET /api/admin/drivers/:userId
      getDriver: (userId) => request(`/admin/drivers/${userId}`),

      // PATCH /api/admin/drivers/:userId/verification
      updateDriverVerification: (userId, { status, reason }) =>
        request(`/admin/drivers/${userId}/verification`, {
          method: "PATCH",
          body: reason ? { status, reason } : { status },
        }),
    }),
    [request]
  );
};
