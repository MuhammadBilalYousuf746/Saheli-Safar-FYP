import { useMemo } from "react";

export const useAdminListApi = (request) =>
  useMemo(
    () => ({
      // GET /api/admin/overview
      getOverview: () => request("/admin/overview"),

      // GET /api/admin/drivers?verificationStatus=&page=&limit=
      listDrivers: (query) => request("/admin/drivers", { query }),

      // GET /api/admin/users?role=&status=&page=&limit=
      listUsers: (query) => request("/admin/users", { query }),
    }),
    [request]
  );
