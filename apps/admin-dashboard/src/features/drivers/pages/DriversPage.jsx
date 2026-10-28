import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useAuth } from "../../../features/auth/context/AuthContext";
import { useAdminListApi } from "../../../shared/services/admin-list.service";
import Pagination from "../../../shared/components/Pagination";
import StatusBadge from "../../../shared/components/StatusBadge";
import { EmptyState, ErrorState, LoadingState } from "../../../shared/components/States";
import { capitalize, formatDate, formatPhone } from "../../../shared/utils/format";

const TABS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const PAGE_SIZE = 20;

const DriversPage = () => {
  const { request } = useAuth();
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
          <p className="muted">
            Review driver documents and approve or reject applications.
          </p>
        </div>
      </header>

      <div className="tabs drivers-tabs" role="tablist">
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

      <section className="card drivers-list-card">
        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : !data ? (
          <LoadingState label="Loading drivers…" />
        ) : data.drivers.length === 0 ? (
          <EmptyState
            title="No drivers found"
            message="Drivers appear here after they submit their profile."
          />
        ) : (
          <>
            <div className="table-wrap drivers-table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Driver</th>
                    <th>Vehicle</th>
                    <th>Verification</th>
                    <th>Account</th>
                    <th>Submitted</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {data.drivers.map((driver) => (
                    <tr key={driver.id}>
                      <td>
                        <strong>{driver.fullName}</strong>
                        <span className="cell-sub">
                          {formatPhone(driver.phone)}
                        </span>
                      </td>
                      <td>
                        {driver.vehicle.make} {driver.vehicle.model}
                        <span className="cell-sub">
                          {capitalize(driver.vehicle.type)} ·{" "}
                          {driver.vehicle.plateNumber}
                        </span>
                      </td>
                      <td>
                        <StatusBadge value={driver.verificationStatus} />
                      </td>
                      <td>
                        <StatusBadge value={driver.status} />
                      </td>
                      <td>{formatDate(driver.submittedAt)}</td>
                      <td className="cell-actions">
                        <Link
                          to={`/drivers/${driver.id}`}
                          className="btn btn-secondary btn-sm"
                        >
                          {driver.verificationStatus === "pending"
                            ? "Review"
                            : "View"}
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
