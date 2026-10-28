import { useEffect, useState } from "react";
import { Moon, Sun, Sunrise, Sunset } from "lucide-react";

import { useAuth } from "../../features/auth/context/AuthContext";
import { getGreetingPeriod, isFreshLoginWelcome } from "../utils/greeting";

const ICONS = { moon: Moon, sun: Sun, sunrise: Sunrise, sunset: Sunset };

const AdminGreeting = () => {
  const { admin, loginWelcome, consumeLoginWelcome } = useAuth();
  const [now, setNow] = useState(() => new Date());
  const [welcomedAt, setWelcomedAt] = useState(null);

  useEffect(() => {
    if (!loginWelcome) return;
    if (isFreshLoginWelcome(loginWelcome)) setWelcomedAt(loginWelcome.createdAt);
    consumeLoginWelcome();
  }, [loginWelcome, consumeLoginWelcome]);

  useEffect(() => {
    const update = () => setNow(new Date());
    const interval = window.setInterval(update, 60000);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  useEffect(() => {
    if (welcomedAt === null) return undefined;
    const timeout = window.setTimeout(() => setNow(new Date()), Math.max(0, welcomedAt + 8000 - Date.now()));
    return () => window.clearTimeout(timeout);
  }, [welcomedAt]);

  const period = getGreetingPeriod(now);
  const Icon = ICONS[period.icon];
  const welcome = welcomedAt !== null && now.getTime() < welcomedAt + 8000;
  const name = admin?.fullName?.trim() || "Administrator";
  return (
    <span className="admin-greeting">
      <Icon size={20} aria-hidden="true" />
      <span>{welcome ? "Welcome back" : period.text}, {name}!</span>
    </span>
  );
};

export default AdminGreeting;
