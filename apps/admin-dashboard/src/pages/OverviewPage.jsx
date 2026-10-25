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

import { useAdminApi } from "../services/admin.service";
import { useAuth } from "../context/AuthContext";
import { EmptyState, ErrorState, LoadingState } from "../components/States";
import { formatDate, formatPhone, formatVehicle } from "../utils/format";

// Count-only request: we only need pagination.total.
const COUNT = { limit: 1 };

const OverviewPage = () => {
  const api = useAdminApi();
  const { admin } = useAuth();

  const [stats, setStats] = useState(null);
  const [recentPending, setRecentPending] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    setStats(null);

    try {
      const [
        pending,
        approved,
        rejected,
        passengers,
        drivers,
        suspended,
      ] = await Promise.all([
        api.listDrivers({ verificationStatus: "pending", limit: 5 }),
        api.listDrivers({ verificationStatus: "approved", ...COUNT }),
        api.listDrivers({ verificationStatus: "rejected", ...COUNT }),
        api.listUsers({ role: "passenger", ...COUNT }),
        api.listUsers({ role: "driver", ...COUNT }),
        api.listUsers({ status: "suspended", ...COUNT }),
      ]);

      setStats({
        pending: pending.pagination.total,
        approved: approved.pagination.total,
        rejected: rejected.pagination.total,
        passengers: passengers.pagination.total,
        drivers: drivers.pagination.total,
        suspended: suspended.pagination.total,
      });
      setRecentPending(pending.drivers);
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
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Welcome back{admin?.fullName ? `, ${admin.fullName}` : ""}</h1>
          <p className="muted">Here is what is happening on Saheli Safar.</p>
        </div>
      </header>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !stats ? (
        <LoadingState label="Loading dashboard…" />
      ) : (
        <>
          <section className="stat-grid">
            {cards.map(({ label, value, icon: Icon, tone, to }) => (
              <Link key={label} to={to} className="stat-card">
                <span className={`stat-icon tone-${tone}`}>
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div>
                  <span className="stat-value">{value}</span>
                  <span className="stat-label">{label}</span>
                </div>
              </Link>
            ))}
          </section>

          <section className="card">
            <div className="card-header">
              <h2>Drivers awaiting verification</h2>
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
                          {formatPhone(driver.phone)} ·{" "}
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
