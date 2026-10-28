export const hasFullAdminAccess = (admin) =>
  Array.isArray(admin?.permissions) &&
  admin.permissions.includes("manageAdmins");

export const getAdminLoginRedirect = (admin, requestedPath) => {
  const redirectTo = requestedPath || "/";

  if (!hasFullAdminAccess(admin) && redirectTo === "/") {
    return "/drivers";
  }

  return redirectTo;
};
