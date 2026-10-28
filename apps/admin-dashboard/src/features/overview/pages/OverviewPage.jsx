import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Car,
  Clock,
  ShieldAlert,
  UserRound,
  XCircle,
} from "lucide-react";

import { useAdminListApi } from "../../../shared/services/admin-list.service";
import { useAuth } from "../../../features/auth/context/AuthContext";
import { EmptyState, ErrorState, LoadingState } from "../../../shared/components/States";
import { formatDate, formatVehicle } from "../../../shared/utils/format";

const OverviewPage = () => {
  const { admin, request } = useAuth();
  const api = useAdminListApi(request);

  const [stats, setStats] = useState(null);
  const [recentPending, setRecentPending] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    setStats(null);

    try {
      const data = await api.getOverview();
      setStats(data.stats);
      setRecentPending(data.recentPending);
    } catch (err) {
      setError(err.message);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const cards = stats && [
    {
      label: "Passengers",
      value: stats.passengers,
      icon: UserRound,
      tone: "info",
      to: "/users?role=passenger",
    },
    {
      label: "Drivers",
      value: stats.drivers,
      icon: Car,
      tone: "brand",
      to: "/users?role=driver",
    },
    {
      label: "Awaiting verification",
      value: stats.pending,
      icon: Clock,
      tone: "warning",
      to: "/drivers?verificationStatus=pending",
    },
    {
      label: "Approved drivers",
      value: stats.approved,
      icon: BadgeCheck,
      tone: "success",
      to: "/drivers?verificationStatus=approved",
    },
    {
      label: "Rejected drivers",
      value: stats.rejected,
      icon: XCircle,
      tone: "error",
      to: "/drivers?verificationStatus=rejected",
    },
    {
      label: "Suspended accounts",
      value: stats.suspended,
      icon: ShieldAlert,
      tone: "neutral",
      to: "/users?status=suspended",
    },
  ];

  return (
    <div className="page overview-page">
      <header className="page-header">
        <div className="overview-heading">
          <span className="eyebrow">ADMIN OVERVIEW</span>
          <h1>Welcome back{admin?.fullName ? `, ${admin.fullName}` : ""}</h1>
          <p className="muted">A clear view of current passenger and driver operations.</p>
        </div>
      </header>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !stats ? (
        <LoadingState label="Loading dashboard…" />
      ) : (
        <>
          <section className="stat-grid overview-stat-grid">
            {cards.map(({ label, value, icon: Icon, tone, to }) => (
              <Link key={label} to={to} className="stat-card overview-stat-card">
                <span className={`stat-icon overview-stat-icon tone-${tone}`}>
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div>
                  <span className="stat-value overview-stat-value">{value}</span>
                  <span className="stat-label overview-stat-label">{label}</span>
                </div>
              </Link>
            ))}
          </section>

          <section className="card overview-pending-card">
            <div className="card-header">
              <div>
                <span className="eyebrow">REVIEW QUEUE</span>
                <h2>Drivers awaiting verification</h2>
              </div>
              <Link to="/drivers?verificationStatus=pending" className="link">
                View all
              </Link>
            </div>

            {recentPending.length === 0 ? (
              <EmptyState
                title="All caught up"
                message="There are no drivers waiting for verification."
              />
            ) : (
              <ul className="list">
                {recentPending.map((driver) => (
                  <li key={driver.id}>
                    <Link to={`/drivers/${driver.id}`} className="list-item">
                      <div>
                        <strong>{driver.fullName}</strong>
                        <span className="muted small">
                          {formatVehicle(driver.vehicle)}
                        </span>
                      </div>
                      <span className="muted small">
                        Submitted {formatDate(driver.submittedAt)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default OverviewPage;
