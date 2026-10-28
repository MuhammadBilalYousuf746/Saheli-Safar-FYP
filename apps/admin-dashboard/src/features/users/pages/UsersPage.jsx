import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../../../features/auth/context/AuthContext";
import { useAdminListApi } from "../../../shared/services/admin-list.service";
import Pagination from "../../../shared/components/Pagination";
import StatusBadge from "../../../shared/components/StatusBadge";
import UserStatusActions from "../components/UserStatusActions";
import { EmptyState, ErrorState, LoadingState } from "../../../shared/components/States";
import { formatDate, formatDateTime, formatPhone } from "../../../shared/utils/format";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending registration" },
  { value: "suspended", label: "Suspended" },
  { value: "disabled", label: "Disabled" },
];

const PAGE_SIZE = 20;

const UsersPage = () => {
  const { request } = useAuth();
  const api = useAdminListApi(request);
  const [searchParams, setSearchParams] = useSearchParams();

  // Preserve old driver-directory bookmarks without mixing the passenger list.
  const isDriverDirectory = searchParams.get("role") === "driver";
  const status = searchParams.get("status") || "";
  const search = searchParams.get("search") || "";
  const page = Number(searchParams.get("page")) || 1;

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const requestSequence = useRef(0);

  const load = useCallback(async () => {
    const sequence = ++requestSequence.current;
    setError("");
    setData(null);

    try {
      const result = await api.listUsers({ role: "passenger", status, search, page, limit: PAGE_SIZE });
      if (sequence === requestSequence.current) setData(result);
    } catch (err) {
      if (sequence === requestSequence.current) setError(err.message);
    }
  }, [api, status, search, page]);

  useEffect(() => {
    if (!isDriverDirectory) load();
    return () => { requestSequence.current += 1; };
  }, [load, isDriverDirectory]);

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });

    setSearchParams(next);
  };

  // Update one row after a status change, without reloading the list.
  const replaceUser = (updated) =>
    setData((current) => ({
      ...current,
      users: current.users.map((user) =>
        user.id === updated.id ? { ...user, ...updated } : user
      ),
    }));

  if (isDriverDirectory) return <Navigate to="/drivers" replace />;

  return (
    <div className="page users-page">
      <header className="page-header">
        <div>
          <h1>Passengers</h1>
          <p className="muted">
            Manage passenger accounts and review their status.
          </p>
        </div>
        {Number.isInteger(data?.pagination?.total) && (
          <div className="users-count" role="status">
            <strong>{data.pagination.total.toLocaleString()}</strong>
            <span>{search.trim() || status ? "Matching passengers" : "Total passengers"}</span>
          </div>
        )}
      </header>

      <form className="filters users-filters" role="search" aria-label="Search passenger records"
        onSubmit={(event) => {
          event.preventDefault();
          const value = new FormData(event.currentTarget).get("search").trim();
          updateParams({ search: value, page: "" });
        }}>
        <label className="field field-inline users-search-field">
          <span>Search passengers</span>
          <span className="users-search-control">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" />
            </svg>
            <input key={search} type="search" name="search" defaultValue={search}
              maxLength={100} placeholder="Name, email or mobile number" />
          </span>
        </label>
        <label className="field field-inline">
          <span>Account status</span>
          <select
            value={status}
            onChange={(event) =>
              updateParams({ status: event.target.value, page: "" })
            }
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="users-filter-actions">
          <button type="submit" className="btn btn-primary">Search</button>
          <button type="button" className="btn btn-secondary" onClick={(event) => {
            event.currentTarget.form.reset();
            updateParams({ search: "", status: "", page: "" });
          }}>Clear</button>
        </div>
      </form>

      <section className="users-card" aria-label="Passenger directory">
        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : !data ? (
          <LoadingState label="Loading passengers…" />
        ) : data.users.length === 0 ? (
          <EmptyState
            title="No passengers found"
            message={search.trim() ? "No passengers match this search. Try another name, email or mobile number." : status ? "No passengers match this account status. Clear the filter to see all passengers." : "Passenger accounts will appear here after registration."}
          />
        ) : (
          <>
            <div className="table-wrap users-table-wrap">
              <table className="table users-table">
                <thead>
                  <tr>
                    <th scope="col">Passenger</th>
                    <th scope="col">Contact</th>
                    <th scope="col">Joined</th>
                    <th scope="col">Account status</th>
                    <th scope="col" className="users-actions-heading">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((user) => (
                    <tr key={user.id}>
                      <td className="users-name">
                        <div className="users-identity">
                          <span className="users-initial" aria-hidden="true">{Array.from(user.fullName?.trim() || "?")[0].toUpperCase()}</span>
                          <strong>{user.fullName || "Name not provided"}</strong>
                        </div>
                      </td>
                      <td className="users-contact" data-label="Contact">
                        {user.email && <span>{user.email}</span>}
                        {user.phone && <span>{formatPhone(user.phone)}</span>}
                        {!user.email && !user.phone && <span className="muted">Not provided</span>}
                      </td>
                      <td className="users-joined" data-label="Joined">
                        <span>{formatDate(user.createdAt)}</span>
                        {user.lastLoginAt && <span className="cell-sub">Last login {formatDateTime(user.lastLoginAt)}</span>}
                      </td>
                      <td className="users-status" data-label="Account status">
                        <StatusBadge value={user.status} />
                      </td>
                      <td className="users-actions" data-label="Actions">
                        <UserStatusActions
                          user={user}
                          onUpdated={replaceUser}
                          compact
                        />
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

export default UsersPage;
