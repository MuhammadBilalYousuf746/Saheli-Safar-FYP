import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronRight, LayoutDashboard, LogOut, ShieldCheck, UserRound, UsersRound } from "lucide-react";

import { useAuth } from "../../features/auth/context/AuthContext";
import { hasFullAdminAccess } from "../../features/auth/admin-access";
import { useAdminNotifications } from "../services/admin-notifications";

const TopbarActions = ({ admin, onLogout }) => {
  const { request } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
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
  const { notifications, unreadCount: count, loading, error, busy, refresh, mark } = useAdminNotifications(request, open === "notifications");
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
        aria-label={count > 0 ? `Notifications: ${count} unread` : "Notifications"}
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
          {count > 0 && <button className="link notification-mark-all" disabled={busy || !notifications.length} onClick={() => mark()}>Mark all as read</button>}
          {error && <div role="alert"><p>{error}</p><button className="link" onClick={refresh}>Try again</button></div>}
          {loading ? <p role="status">Loading notifications...</p> : !notifications.length && !error ? <p role="status">You're all caught up.</p> : (
            <ul className="notification-list">{notifications.map(notification => <li key={notification.id}>
              <button className={'notification-row' + (notification.read ? '' : ' is-unread')} disabled={busy}
                onClick={async () => { if (notification.read || await mark(notification)) { setOpen(null); navigate(notification.destination); } }}>
                <ShieldCheck size={18} aria-hidden="true" />
                <span><strong>{notification.title}</strong><span>{notification.message}</span><time dateTime={notification.createdAt}>{new Date(notification.createdAt).toLocaleString()}</time><small>{notification.read ? 'Read' : 'Unread'}</small></span>
                <ChevronRight size={14} aria-hidden="true" />
              </button>
            </li>)}</ul>
          )}
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
