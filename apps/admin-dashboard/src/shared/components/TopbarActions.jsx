import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell, ChevronRight, LayoutDashboard, LogOut, ShieldCheck, UserRound, UsersRound } from "lucide-react";

import { useAuth } from "../../features/auth/context/AuthContext";
import { hasFullAdminAccess } from "../../features/auth/admin-access";
import { useAdminListApi } from "../services/admin-list.service";

const TopbarActions = ({ admin, onLogout }) => {
  const { request } = useAuth();
  const api = useAdminListApi(request);
  const location = useLocation();
  const id = useId();
  const containerRef = useRef(null);
  const bellRef = useRef(null);
  const avatarRef = useRef(null);
  const panelRef = useRef(null);
  const [menu, setMenu] = useState({ open: null, presented: null });
  const { open, presented } = menu;
  const setOpen = useCallback((next) => {
    setMenu((current) => {
      const value = typeof next === "function" ? next(current.open) : next;
      return { open: value, presented: value || current.presented };
    });
  }, []);
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const fullAccess = hasFullAdminAccess(admin);
  const displayName = admin?.fullName?.trim() || "Administrator";
  const initial = Array.from(displayName)[0].toUpperCase();
  const profileItems = [
    { label: "Dashboard", to: fullAccess ? "/overview" : "/drivers", icon: LayoutDashboard },
    { label: "My Account", to: "/settings/account", icon: UserRound },
    { label: "Security", to: "/settings/security", icon: ShieldCheck },
    ...(fullAccess ? [{ label: "Admin Management", to: "/settings/admins", icon: UsersRound }] : []),
  ];

  useEffect(() => { setOpen(null); }, [location.key]);

  useLayoutEffect(() => {
    if (!presented) return undefined;
    const panel = panelRef.current;
    const closing = !open;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finishExit = () => setMenu((current) =>
      !current.open && current.presented === presented ? { open: null, presented: null } : current
    );
    if (reducedMotion.matches || !panel?.animate) {
      if (closing) finishExit();
      return undefined;
    }
    const animation = panel.animate(closing ? [
      { opacity: 1, transform: "translateY(0) scale(1)" },
      { opacity: 0, transform: "translateY(-3px) scale(1)" },
    ] : [
      { opacity: 0, transform: "translateY(-4px) scale(0.98)" },
      { opacity: 1, transform: "translateY(0) scale(1)" },
    ], { duration: closing ? 120 : 160, easing: "ease-out", fill: "both" });
    if (closing) animation.finished.then(finishExit).catch(() => {});
    const reduce = (event) => {
      if (!event.matches) return;
      animation.cancel();
      if (closing) finishExit();
    };
    reducedMotion.addEventListener("change", reduce);
    return () => {
      reducedMotion.removeEventListener("change", reduce);
      animation.cancel();
    };
  }, [open, presented]);

  useEffect(() => {
    if (!open) return undefined;
    const trigger = open === "profile" ? avatarRef.current : bellRef.current;
    const panel = panelRef.current;
    (open === "profile" ? panel.querySelector('[role="menuitem"]') : panel)?.focus();
    const outside = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(null);
    };
    const escape = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(null);
        trigger?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  useEffect(() => {
    if (open !== "notifications") return undefined;
    let cancelled = false;
    setLoading(true);
    setError("");
    setCount(null);
    // This list endpoint is authorized for both Full and Standard Access.
    api.listDrivers({ verificationStatus: "pending", page: 1, limit: 1 })
      .then((data) => {
        const total = data.pagination?.total;
        if (!Number.isInteger(total) || total < 0) throw new Error("Pending verification information is unavailable.");
        if (!cancelled) setCount(total);
      })
      .catch((failure) => { if (!cancelled) setError(failure.message || "Unable to load alerts."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, retry, api]);

  const menuKeys = (event) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const items = [...panelRef.current.querySelectorAll('[role="menuitem"]')];
    const index = items.indexOf(document.activeElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1
      : (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    items[next]?.focus();
  };

  return (
    <div className="topbar-actions" ref={containerRef}
      onBlur={(event) => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(null); }}>
      <button ref={bellRef} type="button" className="topbar-bell"
        aria-label={count > 0 ? `Notifications: ${count} pending driver verifications` : "Notifications"}
        aria-haspopup="dialog" aria-expanded={open === "notifications"} aria-controls={`${id}-notifications`}
        onClick={() => setOpen((current) => current === "notifications" ? null : "notifications")}>
        <Bell size={20} aria-hidden="true" />
        {count > 0 && <span className="topbar-alert-count" aria-hidden="true">{count > 99 ? "99+" : count}</span>}
      </button>
      <button ref={avatarRef} type="button" className="topbar-avatar"
        aria-label="Open administrator profile menu" title="Administrator profile"
        aria-haspopup="menu" aria-expanded={open === "profile"} aria-controls={`${id}-profile`}
        onClick={() => setOpen((current) => current === "profile" ? null : "profile")}>
        {initial}
      </button>
      {presented === "notifications" && (
        <section ref={panelRef} id={`${id}-notifications`} className="topbar-dropdown topbar-notifications"
          data-closing={!open} inert={!open} aria-hidden={!open ? true : undefined}
          role="dialog" aria-labelledby={`${id}-notifications-title`} tabIndex={-1}>
          <h2 id={`${id}-notifications-title`}>Notifications</h2>
          {loading || (count === null && !error) ? <p role="status">Loading alerts…</p> : error ? (
            <div><p role="alert">{error}</p><button className="link" type="button" onClick={() => setRetry((value) => value + 1)}>Try again</button></div>
          ) : count > 0 ? (
            <Link className="topbar-notification-link" to="/drivers?verificationStatus=pending" onClick={() => setOpen(null)}>
              <span><strong>{count} driver {count === 1 ? "application" : "applications"}</strong><span>Awaiting verification</span></span>
              <ChevronRight size={16} aria-hidden="true" />
            </Link>
          ) : <p role="status">You're all caught up!</p>}
        </section>
      )}
      {presented === "profile" && (
        <div ref={panelRef} id={`${id}-profile`} className="topbar-dropdown topbar-profile-menu"
          data-closing={!open} inert={!open} aria-hidden={!open ? true : undefined}
          role="menu" aria-label="Administrator profile" onKeyDown={menuKeys}>
          <div className="topbar-profile-summary" role="presentation">
            <span className="topbar-profile-initial" aria-hidden="true">{initial}</span>
            <div><strong>{displayName}</strong><span>{fullAccess ? "Full Access" : "Standard Access"}</span></div>
          </div>
          {profileItems.map(({ label, to, icon: Icon }) => (
            <Link key={to} role="menuitem" to={to} onClick={() => setOpen(null)}>
              <Icon size={16} aria-hidden="true" />{label}
            </Link>
          ))}
          <button type="button" role="menuitem" className="topbar-profile-logout" onClick={onLogout}>
            <LogOut size={16} aria-hidden="true" />Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default TopbarActions;
