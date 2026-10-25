import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Car,
  Menu,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  X,
} from "lucide-react";

import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import { initials } from "../utils/format";

const NAV_ITEMS = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/drivers", label: "Drivers", icon: Car },
  { to: "/users", label: "Users", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
];

const Layout = () => {
  const { admin, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
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
      } else {
        setIsSidebarExpanded(false);
      }
    };

    drawerQuery.addEventListener("change", updateDrawerMode);
    return () => drawerQuery.removeEventListener("change", updateDrawerMode);
  }, []);

  const expandDesktopSidebar = () => {
    const desktopHover = window.matchMedia(
      "(min-width: 1024px) and (hover: hover) and (pointer: fine)"
    );

    if (desktopHover.matches) {
      setIsSidebarExpanded(true);
    }
  };

  const collapseDesktopSidebar = (event) => {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    if (
      event.type === "pointerleave" &&
      event.currentTarget.contains(document.activeElement)
    ) {
      return;
    }

    setIsSidebarExpanded(false);
  };

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
    <div
      className={`layout${isSidebarExpanded ? " is-sidebar-expanded" : ""}`}
    >
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
        onPointerEnter={expandDesktopSidebar}
        onPointerLeave={collapseDesktopSidebar}
        onFocus={expandDesktopSidebar}
        onBlur={collapseDesktopSidebar}
      >
        <div className="sidebar-brand">
          <img src={logo} alt="Saheli Safar" className="sidebar-logo" />
          <div className="sidebar-brand-text">
            <strong>Saheli Safar</strong>
            <span>Admin Panel</span>
          </div>
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
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
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

        <div className="sidebar-footer">
          <div className="admin-chip">
            <span
              className="avatar"
              role="img"
              aria-label={`Admin: ${admin?.fullName || "Admin"}`}
            >
              {initials(admin?.fullName)}
            </span>
            <div className="admin-chip-text">
              <strong>{admin?.fullName || "Admin"}</strong>
              <span>{admin?.email}</span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-ghost-dark"
            aria-label="Logout"
            title="Logout"
            onClick={logout}
          >
            <LogOut size={16} aria-hidden="true" />
            <span className="sidebar-label">Logout</span>
          </button>
        </div>
      </aside>

      <main className="main" inert={isDrawerMode && isMobileOpen}>
        <div className="mobile-header">
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
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
