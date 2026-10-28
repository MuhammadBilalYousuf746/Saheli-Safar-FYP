import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAdminListApi } from "../../../shared/services/admin-list.service";
import { useAuth } from "../../../features/auth/context/AuthContext";
import { EmptyState, ErrorState, LoadingState } from "../../../shared/components/States";
import { formatDate } from "../../../shared/utils/format";
import AdminGreeting from "../../../shared/components/AdminGreeting";

const OverviewPage = () => {
  const { request } = useAuth();
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

  const metrics = stats && [
    {
      label: "Passengers",
      value: stats.passengers,
      tone: "info",
      to: "/users?role=passenger",
    },
    {
      label: "Drivers",
      value: stats.drivers,
      tone: "brand",
      to: "/users?role=driver",
    },
    {
      label: "Pending verifications",
      value: stats.pending,
      tone: "warning",
      to: "/drivers?verificationStatus=pending",
    },
    {
      label: "Approved drivers",
      value: stats.approved,
      tone: "success",
      to: "/drivers?verificationStatus=approved",
    },
    {
      label: "Rejected drivers",
      value: stats.rejected,
      tone: "error",
      to: "/drivers?verificationStatus=rejected",
    },
    {
      label: "Suspended accounts",
      value: stats.suspended,
      tone: "error",
      to: "/users?status=suspended",
    },
  ];

  return (
    <div className="page overview-page">
      <header className="page-header">
        <div className="overview-heading">
          <h1><AdminGreeting /></h1>
          <p className="muted">An overview of passenger and driver operations.</p>
        </div>
      </header>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !stats ? (
        <LoadingState label="Loading dashboard…" />
      ) : (
        <>
          <section className="overview-metrics" aria-label="Operational statistics">
            <div className="overview-primary-metrics">
              {metrics.slice(0, 3).map(({ label, value, to }) => (
                <Link key={label} to={to} className="overview-primary-metric">
                  <span className="overview-metric-label">{label}</span>
                  <span className="overview-metric-value">{value}</span>
                </Link>
              ))}
            </div>
            <div className="overview-status-metrics">
              {metrics.slice(3).map(({ label, value, tone, to }) => (
                <Link key={label} to={to} className="overview-status-metric">
                  <span className={`overview-status-dot tone-${tone}`} aria-hidden="true" />
                  <span>{label}</span><strong>{value}</strong>
                </Link>
              ))}
            </div>
          </section>

          <section className="overview-queue" aria-labelledby="overview-queue-title">
            <div className="overview-queue-header">
              <div>
                <h2 id="overview-queue-title">Drivers awaiting verification</h2>
                <p>Review pending applications before drivers can get on the road.</p>
              </div>
              <Link to="/drivers?verificationStatus=pending" className="link">View all</Link>
            </div>
            {recentPending.length === 0 ? (
              <div className="overview-queue-empty">
                <EmptyState title="All caught up" message="No driver applications are awaiting verification." />
              </div>
            ) : (
              <table className="overview-queue-table">
                <thead><tr>
                  <th scope="col">Driver</th>
                  <th scope="col">Application date</th>
                  <th scope="col">Verification status</th>
                  <th scope="col"><span className="overview-action-label">Action</span></th>
                </tr></thead>
                <tbody>
                  {recentPending.map((driver) => (
                    <tr key={driver.id}>
                      <th scope="row">{driver.fullName}</th>
                      <td data-label="Application date">{formatDate(driver.submittedAt)}</td>
                      <td data-label="Verification status"><span className="overview-pending-status">Pending</span></td>
                      <td className="overview-queue-action">
                        <Link to={`/drivers/${driver.id}`} className="link" aria-label={`View application for ${driver.fullName}`}>
                          View application <span aria-hidden="true">&rarr;</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default OverviewPage;
