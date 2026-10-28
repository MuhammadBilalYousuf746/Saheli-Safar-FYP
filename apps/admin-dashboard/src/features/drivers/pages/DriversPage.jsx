import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useAuth } from "../../../features/auth/context/AuthContext";
import { useAdminListApi } from "../../../shared/services/admin-list.service";
import Pagination from "../../../shared/components/Pagination";
import StatusBadge from "../../../shared/components/StatusBadge";
import { EmptyState, ErrorState, LoadingState } from "../../../shared/components/States";
import { capitalize, formatDate } from "../../../shared/utils/format";
import AdminGreeting from "../../../shared/components/AdminGreeting";
import { hasFullAdminAccess } from "../../auth/admin-access";

const TABS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const PAGE_SIZE = 20;

const DriversPage = () => {
  const { admin, request } = useAuth();
  const api = useAdminListApi(request);
  const [searchParams, setSearchParams] = useSearchParams();

  const verificationStatus = searchParams.get("verificationStatus") || "";
  const page = Number(searchParams.get("page")) || 1;

  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    setData(null);

    try {
      setData(
        await api.listDrivers({
          verificationStatus,
          page,
          limit: PAGE_SIZE,
        })
      );
    } catch (err) {
      setError(err.message);
    }
  }, [api, verificationStatus, page]);

  useEffect(() => {
    load();
  }, [load]);

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });

    setSearchParams(next);
  };

  return (
    <div className="page drivers-page">
      <header className="page-header">
        <div>
          <h1>Drivers</h1>
          {!hasFullAdminAccess(admin) && <p className="drivers-greeting"><AdminGreeting /></p>}
          <p className="muted">
            Manage driver applications and verification records.
          </p>
        </div>
      </header>

      <div className="drivers-toolbar">
        <div className="tabs drivers-tabs" role="tablist" aria-label="Verification status">
          {TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={verificationStatus === tab.value}
              className={`tab${verificationStatus === tab.value ? " active" : ""}`}
              onClick={() =>
                updateParams({ verificationStatus: tab.value, page: "" })
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <section className="drivers-list-card" aria-label="Driver applications">
        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : !data ? (
          <LoadingState label="Loading drivers…" />
        ) : data.drivers.length === 0 ? (
          <EmptyState
            title="No drivers found"
            message={verificationStatus ? "No applications match this verification status. Choose All to see every application." : "Drivers appear here after they submit their profile."}
          />
        ) : (
          <>
            <div className="table-wrap drivers-table-wrap">
              <table className="table drivers-table">
                <thead>
                  <tr>
                    <th scope="col">Driver</th>
                    <th scope="col">Vehicle</th>
                    <th scope="col">Verification</th>
                    <th scope="col">Account</th>
                    <th scope="col">Submitted</th>
                    <th scope="col" className="drivers-actions-heading">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.drivers.map((driver) => (
                    <tr key={driver.id}>
                      <td className="drivers-name">
                        <strong>{driver.fullName}</strong>
                      </td>
                      <td data-label="Vehicle" className="drivers-vehicle">
                        {driver.vehicle?.make} {driver.vehicle?.model}
                        <span className="cell-sub">
                          {capitalize(driver.vehicle?.type)}
                        </span>
                      </td>
                      <td data-label="Verification" className="drivers-verification">
                        <StatusBadge value={driver.verificationStatus} />
                      </td>
                      <td data-label="Account" className="drivers-account">
                        <StatusBadge value={driver.status} />
                      </td>
                      <td data-label="Submitted" className="drivers-submitted">{formatDate(driver.submittedAt)}</td>
                      <td className="cell-actions">
                        <Link
                          to={`/drivers/${driver.id}`}
                          className="link drivers-view-link"
                          aria-label={`View details for ${driver.fullName}`}
                        >
                          View details <span aria-hidden="true">&rarr;</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              pagination={data.pagination}
              onPageChange={(next) => updateParams({ page: String(next) })}
            />
          </>
        )}
      </section>
    </div>
  );
};

export default DriversPage;
