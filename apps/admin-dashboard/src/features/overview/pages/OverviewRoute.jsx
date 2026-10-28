import { Navigate } from "react-router-dom";

import { useAuth } from "../../auth/context/AuthContext";
import { hasFullAdminAccess } from "../../auth/admin-access";
import OverviewPage from "./OverviewPage";

const OverviewRoute = () => {
  const { admin } = useAuth();

  if (!hasFullAdminAccess(admin)) {
    return <Navigate to="/drivers" replace />;
  }

  return <OverviewPage />;
};

export default OverviewRoute;
