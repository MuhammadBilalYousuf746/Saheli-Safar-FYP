import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ShieldCheck, Trash2 } from "lucide-react";

import Modal from "../../../shared/components/Modal";
import StatusBadge from "../../../shared/components/StatusBadge";
import { useAuth } from "../../../features/auth/context/AuthContext";
import { useSettingsApi } from "../services/admin.service";

const AdminAccountSection = () => {
  const api = useSettingsApi();
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [email, setEmail] = useState(admin?.email || "");
  const [pendingEmail, setPendingEmail] = useState(admin?.pendingEmail || "");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailNotice, setEmailNotice] = useState("");
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    setEmailError("");
    setEmailNotice("");
    const normalizedEmail = email.trim().toLowerCase();

    if (
      normalizedEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      setEmailError("Enter a valid email address.");
      return;
    }
    if (!emailPassword) {
      setEmailError("Enter your password to confirm this change.");
      return;
    }

    setIsEmailSubmitting(true);
    try {
      const result = await api.updateOwnAdminEmail({
        email: normalizedEmail,
        password: emailPassword,
      });
      setEmailNotice(result.message);
      setPendingEmail(normalizedEmail);
      setEmailPassword("");
      setEmailDialogOpen(false);
    } catch (error) {
      setEmailError(error.message);
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  const resendVerification = async () => {
    setEmailError("");
    setEmailNotice("");
    setIsResending(true);
    try {
      const result = await api.resendOwnAdminEmailVerification();
      setEmailNotice(result.message);
      setEmailError("");
    } catch (error) {
      setEmailError(error.message);
    } finally {
      setIsResending(false);
    }
  };

  const handleDeleteAccount = async (event) => {
    event.preventDefault();
    setDeleteError("");

    if (deleteConfirmation !== "DELETE") {
      setDeleteError('Type "DELETE" exactly to confirm.');
      return;
    }
    if (!deletePassword) {
      setDeleteError("Enter your password to confirm this action.");
      return;
    }

    setIsDeleting(true);
    try {
      await api.deactivateOwnAdmin({
        password: deletePassword,
        confirmation: deleteConfirmation,
      });
      logout();
      navigate("/login", {
        replace: true,
        state: { accountDeactivated: true },
      });
    } catch (error) {
      setDeleteError(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <section className="card settings-card settings-account-card">
        <div className="card-header">
          <div>
            <h2 className="card-title">My Account</h2>
            <p className="muted">
              Manage your Saheli Safar Admin account and contact email.
            </p>
          </div>
        </div>

        <dl className="admin-account-details">
          <div>
            <dt>Full name</dt>
            <dd>{admin?.fullName || "Not provided"}</dd>
          </div>
          <div>
            <dt>Current email</dt>
            <dd>{admin?.email || "Not provided"}</dd>
          </div>
          <div>
            <dt>Account status</dt>
            <dd><StatusBadge value={admin?.status || "unknown"} /></dd>
          </div>
          <div>
            <dt>Access level</dt>
            <dd>
              {admin?.permissions?.includes("manageAdmins") ? (
                <span className="badge badge-brand">
                  <ShieldCheck size={12} aria-hidden="true" />
                  Full Access
                </span>
              ) : (
                <span className="badge badge-neutral">Standard Access</span>
              )}
            </dd>
          </div>
        </dl>

        {emailNotice && (
          <p className="inline-note" role="status">{emailNotice}</p>
        )}
        {emailError && !emailDialogOpen && (
          <p className="form-error" role="alert">{emailError}</p>
        )}

        <div className="admin-account-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setEmail(admin?.email || "");
              setEmailPassword("");
              setEmailError("");
              setEmailDialogOpen(true);
            }}
          >
            <Mail size={16} aria-hidden="true" />
            Change Email
          </button>
          {pendingEmail && (
            <div className="inline-note">
              Verification pending for <strong>{pendingEmail}</strong>.
              <button
                type="button"
                className="link admin-resend-link"
                onClick={resendVerification}
                disabled={isResending}
              >
                {isResending ? "Sending…" : "Resend verification"}
              </button>
            </div>
          )}
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              setDeletePassword("");
              setDeleteConfirmation("");
              setDeleteError("");
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 size={16} aria-hidden="true" />
            Delete My Account
          </button>
        </div>
      </section>

      {emailDialogOpen && (
        <Modal
          title="Change My Email"
          onClose={() => {
            if (isEmailSubmitting) return;
            setEmailDialogOpen(false);
            setEmailError("");
          }}
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={isEmailSubmitting}
                onClick={() => setEmailDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="change-own-admin-email-form"
                className="btn btn-primary"
                disabled={isEmailSubmitting}
              >
                {isEmailSubmitting ? "Sending…" : "Send verification"}
              </button>
            </>
          }
        >
          <form
            id="change-own-admin-email-form"
            className="form"
            onSubmit={handleEmailSubmit}
            noValidate
          >
            <label className="field">
              <span>Current email</span>
              <input type="email" value={admin?.email || ""} readOnly />
            </label>
            <label className="field">
              <span>New email address</span>
              <input
                type="email"
                autoFocus
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isEmailSubmitting}
                required
              />
            </label>
            <label className="field">
              <span>Current password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={emailPassword}
                onChange={(event) => setEmailPassword(event.target.value)}
                disabled={isEmailSubmitting}
                required
              />
            </label>
            <p className="muted small">
              We will send a verification link to the new address. Your current
              email remains active until you verify it.
            </p>
            {emailError && (
              <p className="form-error" role="alert">{emailError}</p>
            )}
          </form>
        </Modal>
      )}

      {deleteDialogOpen && (
        <Modal
          title="Deactivate My Admin Account"
          onClose={() => {
            if (isDeleting) return;
            setDeleteDialogOpen(false);
          }}
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={isDeleting}
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="deactivate-own-admin-form"
                className="btn btn-danger"
                disabled={
                  isDeleting ||
                  deleteConfirmation !== "DELETE" ||
                  !deletePassword
                }
              >
                {isDeleting ? "Deactivating…" : "Deactivate account"}
              </button>
            </>
          }
        >
          <form
            id="deactivate-own-admin-form"
            className="form"
            onSubmit={handleDeleteAccount}
            noValidate
          >
            <p>
              Deactivate your Admin account, <strong>{admin?.email}</strong>?
            </p>
            <div className="inline-note destructive-note">
              Your dashboard access will be revoked immediately, and your
              existing sessions will stop working. Your account history will be
              retained. The last active Full Access account cannot be
              deactivated.
            </div>
            <label className="field">
              <span>Type DELETE to confirm</span>
              <input
                type="text"
                autoFocus
                autoComplete="off"
                value={deleteConfirmation}
                onChange={(event) =>
                  setDeleteConfirmation(event.target.value)
                }
                disabled={isDeleting}
                required
              />
            </label>
            <label className="field">
              <span>Current password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={deletePassword}
                onChange={(event) => setDeletePassword(event.target.value)}
                disabled={isDeleting}
                required
              />
            </label>
            {deleteError && (
              <p className="form-error" role="alert">{deleteError}</p>
            )}
          </form>
        </Modal>
      )}
    </>
  );
};

export default AdminAccountSection;
