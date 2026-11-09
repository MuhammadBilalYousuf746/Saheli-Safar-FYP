import { useCallback, useEffect, useRef, useState } from "react";

export function useAdminNotifications(request, open) {
  const [data, setData] = useState({ notifications: [], unreadCount: 0 });
  const [loading, setLoading] = useState(true), [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const generation = useRef(0), mounted = useRef(false), mutating = useRef(false), fetching = useRef(false);
  const refresh = useCallback(async () => {
    if (fetching.current || mutating.current || !mounted.current) return;
    fetching.current = true;
    const version = ++generation.current;
    try {
      const result = await request("/admin/notifications");
      if (mounted.current && version === generation.current) { setData(result); setError(""); }
    } catch (failure) {
      if (mounted.current && version === generation.current) setError(failure.message || "Unable to load notifications.");
    } finally {
      if (version === generation.current) {
        fetching.current = false;
        if (mounted.current) setLoading(false);
      }
    }
  }, [request]);
  useEffect(() => {
    mounted.current = true;
    void refresh();
    const visible = () => { if (!document.hidden) void refresh(); };
    const timer = window.setInterval(visible, 30000);
    window.addEventListener("focus", visible);
    document.addEventListener("visibilitychange", visible);
    return () => { mounted.current = false; generation.current++; fetching.current = false; window.clearInterval(timer); window.removeEventListener("focus", visible); document.removeEventListener("visibilitychange", visible); };
  }, [refresh]);
  useEffect(() => { if (open) void refresh(); }, [open, refresh]);
  const mark = async notification => {
    if (mutating.current) return false;
    mutating.current = true; generation.current++; fetching.current = false; setBusy(true); setError("");
    let succeeded = false;
    try {
      await request(notification ? `/admin/notifications/${encodeURIComponent(notification.id)}/read` : "/admin/notifications/read-all", {
        method: "POST", ...(!notification ? { body: { before: data.notifications[0]?.createdAt } } : {}),
      });
      succeeded = true;
      return true;
    } catch (failure) { if (mounted.current) setError(failure.message || "Unable to update notifications."); return false; }
    finally {
      mutating.current = false;
      if (mounted.current) { setBusy(false); if (succeeded) void refresh(); }
    }
  };
  return { ...data, loading, error, busy, refresh, mark };
}
