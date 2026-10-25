import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useAdminApi } from "../services/admin.service";
import Pagination from "../components/Pagination";
import StatusBadge from "../components/StatusBadge";
import UserStatusActions from "../components/UserStatusActions";
import { EmptyState, ErrorState, LoadingState } from "../components/States";
import { formatDate, formatDateTime, formatPhone } from "../utils/format";

const ROLE_OPTIONS = [
  { value: "", label: "All roles" },
  { value: "passenger", label: "Passengers" },
  { value: "driver", label: "Drivers" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending registration" },
  { value: "suspended", label: "Suspended" },
  { value: "disabled", label: "Disabled" },
];

const PAGE_SIZE = 20;

const UsersPage = () => {
  const api = useAdminApi();
  const [searchParams, setSearchParams] = useSearchParams();

  const role = searchParams.get("role") || "";
  const status = searchParams.get("status") || "";
  const page = Number(searchParams.get("page")) || 1;

  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    setData(null);

    try {
      setData(await api.listUsers({ role, status, page, limit: PAGE_SIZE }));
    } catch (err) {
      setError(err.message);
    }
  }, [api, role, status, page]);

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

  // Update one row after a status change, without reloading the list.
  const replaceUser = (updated) =>
    setData((current) => ({
      ...current,
      users: current.users.map((user) =>
        user.id === updated.id ? { ...user, ...updated } : user
      ),
    }));

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Users</h1>
          <p className="muted">
            Passenger and driver accounts. Suspend or reactivate access.
          </p>
        </div>
      </header>

      <div className="filters">
        <label className="field field-inline">
          <span>Role</span>
          <select
            value={role}
            onChange={(event) =>
              updateParams({ role: event.target.value, page: "" })
            }
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field field-inline">
          <span>Status</span>
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
      </div>

      <section className="card">
        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : !data ? (
          <LoadingState label="Loading users…" />
        ) : data.users.length === 0 ? (
          <EmptyState
            title="No users found"
            message="Try a different role or status filter."
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last login</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        {user.role === "driver" && user.fullName ? (
                          <Link to={`/drivers/${user.id}`} className="link">
                            <strong>{user.fullName}</strong>
                          </Link>
                        ) : (
                          <strong>{user.fullName || "Not provided"}</strong>
                        )}
                        <span className="cell-sub">
                          {formatPhone(user.phone)}
                          {user.email ? ` · ${user.email}` : ""}
                        </span>
                      </td>
                      <td>
                        <StatusBadge value={user.role} />
                      </td>
                      <td>
                        <StatusBadge value={user.status} />
                      </td>
                      <td>{formatDateTime(user.lastLoginAt)}</td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
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
