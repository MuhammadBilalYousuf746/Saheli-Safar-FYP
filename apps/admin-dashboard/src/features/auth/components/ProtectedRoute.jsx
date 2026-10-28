import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { LoadingState } from "../../../shared/components/States";

// Only signed-in admins can open dashboard pages.
const ProtectedRoute = () => {
  const { isAuthenticated, isRestoring, isExplicitLogout } = useAuth();
  const location = useLocation();

  if (isRestoring) {
    return <LoadingState fullPage label="Restoring your session…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={isExplicitLogout ? null : { from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
