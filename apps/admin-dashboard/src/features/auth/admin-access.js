export const hasFullAdminAccess = (admin) =>
  Array.isArray(admin?.permissions) &&
  admin.permissions.includes("manageAdmins");

export const getAdminLoginRedirect = (admin, requestedPath) => {
  const fullAccess = hasFullAdminAccess(admin);
  const fallback = fullAccess ? "/overview" : "/drivers";
  if (!requestedPath || !requestedPath.startsWith("/") || requestedPath.startsWith("//")) {
    return fallback;
  }

  const pathname = requestedPath.split(/[?#]/)[0].replace(/\/+$/, "").toLowerCase() || "/";
  if (["/login", "/forgot-password", "/reset-password", "/verify-admin-email"].includes(pathname)) {
    return fallback;
  }

  if (!fullAccess && (pathname === "/" || pathname === "/overview" || /^\/settings\/admins(?:\/|$)/.test(pathname))) {
    return fallback;
  }

  return requestedPath;
};
