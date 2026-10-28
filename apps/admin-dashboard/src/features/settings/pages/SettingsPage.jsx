import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { ShieldCheck, UserRound, UsersRound } from "lucide-react";

import { useAuth } from "../../../features/auth/context/AuthContext";

const SettingsPage = () => {
  const { admin } = useAuth();
  const location = useLocation();

  const canManageAdmins = Array.isArray(admin?.permissions)
    ? admin.permissions.includes("manageAdmins")
    : false;

  const navItems = [
    { to: "/settings/account", label: "My Account", icon: UserRound },
    { to: "/settings/security", label: "Security", icon: ShieldCheck },
    ...(canManageAdmins
      ? [{ to: "/settings/admins", label: "Admin Management", icon: UsersRound }]
      : []),
  ];

  if (!canManageAdmins && location.pathname === "/settings/admins") {
    return <Navigate to="/settings/account" replace />;
  }

  return (
    <div className="page settings-page">
      <header className="page-header settings-header">
        <div>
          <h1>Settings</h1>
          <p className="muted">
            Manage your account, security, and administrative access.
          </p>
        </div>
      </header>

      <div className="settings-shell">
        <aside className="settings-nav-panel" aria-label="Settings navigation">
          <nav className="settings-nav">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `settings-nav-link${isActive ? " active" : ""}`
                }
              >
                <Icon size={18} aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="settings-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
