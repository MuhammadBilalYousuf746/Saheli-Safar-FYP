import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, X } from "lucide-react";

import { useAdminApi } from "../services/admin.service";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import UserStatusActions from "../components/UserStatusActions";
import { ErrorState, LoadingState } from "../components/States";
import {
  capitalize,
  formatDate,
  formatDateTime,
  formatPhone,
} from "../utils/format";

const REASON_MAX_LENGTH = 300;

const Detail = ({ label, children, mono = false }) => (
  <div className="detail">
    <dt>{label}</dt>
    <dd className={mono ? "mono" : undefined}>{children || "—"}</dd>
  </div>
);

const DriverDetailPage = () => {
  const { userId } = useParams();
  const api = useAdminApi();

  const [driver, setDriver] = useState(null);
  const [error, setError] = useState("");

  // "approved" | "rejected" | null
  const [decision, setDecision] = useState(null);
  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setError("");
    setDriver(null);

    try {
      const data = await api.getDriver(userId);
      setDriver(data.driver);
    } catch (err) {
      setError(err.message);
    }
  }, [api, userId]);

  useEffect(() => {
    load();
  }, [load]);

  const closeDecision = () => {
    if (isSaving) return;
    setDecision(null);
    setReason("");
    setActionError("");
  };

  const submitDecision = async () => {
    setIsSaving(true);
    setActionError("");

    try {
      const data = await api.updateDriverVerification(userId, {
        status: decision,
        reason: decision === "rejected" ? reason.trim() : undefined,
      });

      setDriver(data.driver);
      setNotice(data.message);
      setDecision(null);
      setReason("");
    } catch (err) {
      setActionError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <div className="page">
        <BackLink />
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="page">
        <BackLink />
        <LoadingState label="Loading driver…" />
      </div>
    );
  }

  const { vehicle } = driver;
  const isRejecting = decision === "rejected";

  return (
    <div className="page">
      <BackLink />

      <header className="page-header">
        <div>
          <h1>{driver.fullName}</h1>
          <div className="badge-row">
            <StatusBadge
              value={driver.verificationStatus}
              label={`Verification: ${capitalize(driver.verificationStatus)}`}
            />
            <StatusBadge
              value={driver.status}
              label={`Account: ${capitalize(driver.status)}`}
            />
          </div>
        </div>

        <div className="action-row">
          {driver.verificationStatus !== "approved" && (
            <button
              type="button"
              className="btn btn-success"
              onClick={() => setDecision("approved")}
            >
              <Check size={16} aria-hidden="true" />
              Approve
            </button>
          )}
          {driver.verificationStatus !== "rejected" && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setDecision("rejected")}
            >
              <X size={16} aria-hidden="true" />
              Reject
            </button>
          )}
        </div>
      </header>

      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}

      <div className="detail-grid">
        <section className="card">
          <h2 className="card-title">Personal information</h2>
          <dl className="details">
            <Detail label="Full name">{driver.fullName}</Detail>
            <Detail label="Phone">{formatPhone(driver.phone)}</Detail>
            <Detail label="Email">{driver.email}</Detail>
            <Detail label="CNIC" mono>
              {driver.cnic}
            </Detail>
            <Detail label="Joined">{formatDate(driver.createdAt)}</Detail>
            <Detail label="Last login">
              {formatDateTime(driver.lastLoginAt)}
            </Detail>
          </dl>
        </section>

        <section className="card">
          <h2 className="card-title">License & vehicle</h2>
          <dl className="details">
            <Detail label="License number" mono>
              {driver.licenseNumber}
            </Detail>
            <Detail label="Vehicle type">{capitalize(vehicle.type)}</Detail>
            <Detail label="Make & model">
              {vehicle.make} {vehicle.model}
            </Detail>
            <Detail label="Color">{vehicle.color}</Detail>
            <Detail label="Year">{vehicle.year}</Detail>
            <Detail label="Plate number" mono>
              {vehicle.plateNumber}
            </Detail>
          </dl>
        </section>

        <section className="card">
          <h2 className="card-title">Verification</h2>
          <dl className="details">
            <Detail label="Status">
              <StatusBadge value={driver.verificationStatus} />
            </Detail>
            <Detail label="Submitted">
              {formatDateTime(driver.submittedAt)}
            </Detail>
            <Detail label="Reviewed">
              {formatDateTime(driver.verifiedAt)}
            </Detail>
            {driver.verificationStatus === "rejected" && (
              <Detail label="Rejection reason">
                {driver.rejectionReason}
              </Detail>
            )}
          </dl>
        </section>

        <section className="card">
          <h2 className="card-title">Account access</h2>
          <p className="muted small">
            Suspending an account logs the driver out immediately.
          </p>
          <UserStatusActions
            user={{ ...driver, role: "driver" }}
            onUpdated={(user) =>
              setDriver((current) => ({ ...current, status: user.status }))
            }
          />
        </section>
      </div>

      {decision && (
        <Modal
          title={isRejecting ? "Reject driver?" : "Approve driver?"}
          onClose={closeDecision}
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeDecision}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn ${isRejecting ? "btn-danger" : "btn-success"}`}
                onClick={submitDecision}
                disabled={isSaving || (isRejecting && !reason.trim())}
              >
                {isSaving
                  ? "Saving…"
                  : isRejecting
                    ? "Reject driver"
                    : "Approve driver"}
              </button>
            </>
          }
        >
          {isRejecting ? (
            <label className="field">
              <span>Reason for rejection (shown to the driver)</span>
              <textarea
                rows={4}
                maxLength={REASON_MAX_LENGTH}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="e.g. CNIC number does not match the license."
                autoFocus
              />
              <span className="muted small">
                {reason.length}/{REASON_MAX_LENGTH}
              </span>
            </label>
          ) : (
            <p>
              <strong>{driver.fullName}</strong> will be marked as a verified
              driver.
            </p>
          )}
          {actionError && <p className="form-error">{actionError}</p>}
        </Modal>
      )}
    </div>
  );
};

const BackLink = () => (
  <Link to="/drivers" className="back-link">
    <ArrowLeft size={16} aria-hidden="true" />
    Back to drivers
  </Link>
);

export default DriverDetailPage;
