import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Car,
  Menu,
  LayoutDashboard,
  Settings,
  Users,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import logo from "../../assets/logo.png";
import { useAuth } from "../../features/auth/context/AuthContext";
import { hasFullAdminAccess } from "../../features/auth/admin-access";
import DashboardSearch from "./DashboardSearch";
import TopbarActions from "../../shared/components/TopbarActions";
import PageEntrance from "../../shared/components/PageEntrance";

const NAV_ITEMS = [
  { to: "/overview", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/drivers", label: "Drivers", icon: Car },
  { to: "/users", label: "Passengers", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
];

const Layout = () => {
  const { admin, logout, loginWelcome, consumeLoginWelcome } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const landing = hasFullAdminAccess(admin) ? ["/", "/overview"] : ["/drivers"];
    if (loginWelcome && !landing.includes(location.pathname)) consumeLoginWelcome();
  }, [admin, loginWelcome, consumeLoginWelcome, location.pathname]);

  const handleLogout = () => {
    logout({ explicit: true });
    navigate("/login", { replace: true, state: null });
  };
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // Layout unmounts on logout: never carry another session's collapsed state.
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDrawerMode, setIsDrawerMode] = useState(() =>
    window.matchMedia("(max-width: 1023px)").matches
  );
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const wasMobileOpen = useRef(false);

  useEffect(() => {
    const drawerQuery = window.matchMedia("(max-width: 1023px)");
    const updateDrawerMode = () => {
      setIsDrawerMode(drawerQuery.matches);
      if (!drawerQuery.matches) {
        setIsMobileOpen(false);
      }
    };

    drawerQuery.addEventListener("change", updateDrawerMode);
    return () => drawerQuery.removeEventListener("change", updateDrawerMode);
  }, []);

  useEffect(() => {
    if (isMobileOpen) {
      closeButtonRef.current?.focus();
    } else if (wasMobileOpen.current && isDrawerMode) {
      menuButtonRef.current?.focus();
    }

    wasMobileOpen.current = isMobileOpen;
  }, [isMobileOpen, isDrawerMode]);

  useEffect(() => {
    if (!isMobileOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMobileOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = document.querySelectorAll(
        "#admin-sidebar button:not([disabled]), #admin-sidebar a[href]"
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen]);

  useEffect(() => {
    if (!isMobileOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileOpen]);

  return (
    <div className={`layout${isCollapsed && !isDrawerMode ? " is-sidebar-collapsed" : ""}`}>
      {isMobileOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation menu"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        id="admin-sidebar"
        className={`sidebar${isMobileOpen ? " is-open" : ""}`}
        aria-label="Admin navigation"
        aria-hidden={isDrawerMode && !isMobileOpen ? true : undefined}
      >
        <div className="sidebar-brand">
          <button type="button" className="sidebar-brand-toggle"
            aria-label={isDrawerMode ? "Close navigation menu" : isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={isDrawerMode ? isMobileOpen : !isCollapsed}
            aria-controls="admin-sidebar"
            title={isDrawerMode ? "Close navigation" : isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => isDrawerMode ? setIsMobileOpen(false) : setIsCollapsed((collapsed) => !collapsed)}>
            <img src={logo} alt="" className="sidebar-logo" />
            <span className="sidebar-brand-text">
              <strong>Saheli Safar</strong>
              <span>Admin Panel</span>
            </span>
            <span className="sidebar-collapse-hint" aria-hidden="true">
              {isCollapsed && !isDrawerMode ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
            </span>
          </button>
          <button
            ref={closeButtonRef}
            type="button"
            className="sidebar-close-button"
            aria-label="Close navigation menu"
            onClick={() => setIsMobileOpen(false)}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.filter(
            ({ to }) => to !== "/overview" || hasFullAdminAccess(admin)
          ).map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={label}
              aria-label={label}
              className={({ isActive }) =>
                `nav-link${isActive ? " active" : ""}`
              }
              onClick={() => setIsMobileOpen(false)}
            >
              <Icon size={20} aria-hidden="true" />
              <span className="sidebar-label">{label}</span>
            </NavLink>
          ))}
        </nav>

      </aside>

      <main className="main" inert={isDrawerMode && isMobileOpen}>
        <header className="topbar">
          <button
            ref={menuButtonRef}
            type="button"
            className="sidebar-menu-button"
            aria-label="Open navigation menu"
            aria-expanded={isMobileOpen}
            aria-controls="admin-sidebar"
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu size={20} aria-hidden="true" />
          </button>
          <DashboardSearch admin={admin} />
          <TopbarActions admin={admin} onLogout={handleLogout} />
        </header>
        <PageEntrance key={location.pathname}><Outlet /></PageEntrance>
      </main>
    </div>
  );
};

export default Layout;
