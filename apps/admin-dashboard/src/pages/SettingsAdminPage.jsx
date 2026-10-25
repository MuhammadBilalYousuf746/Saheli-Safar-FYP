import { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  MoreVertical,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Trash2,
  UserPlus,
} from "lucide-react";
import { createPortal } from "react-dom";

import Modal from "../components/Modal";
import { EmptyState, ErrorState, LoadingState } from "../components/States";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useAdminApi } from "../services/admin.service";
import { formatDate } from "../utils/format";

const EMPTY_FORM = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  accessLevel: "standard",
};

const validateAdminForm = ({
  fullName,
  email,
  password,
  confirmPassword,
  accessLevel,
}) => {
  const name = fullName.trim();
  const normalizedEmail = email.trim();

  if (!name || name.length < 2) {
    return "Full name must be at least 2 characters.";
  }

  if (name.length > 80) {
    return "Full name must not exceed 80 characters.";
  }

  if (
    normalizedEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  ) {
    return "Enter a valid email address.";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must include upper and lower case letters and a number.";
  }

  if (new TextEncoder().encode(password).length > 72) {
    return "Password must not exceed 72 bytes.";
  }

  if (!["full", "standard"].includes(accessLevel)) {
    return "Choose a valid access level.";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return "";
};

const SettingsAdminPage = () => {
  const api = useAdminApi();
  const { admin } = useAuth();
  const canManageAdmins = Array.isArray(admin?.permissions)
    ? admin.permissions.includes("manageAdmins")
    : false;

  const [admins, setAdmins] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [accessAdmin, setAccessAdmin] = useState(null);
  const [selectedAccessLevel, setSelectedAccessLevel] = useState("standard");
  const [accessError, setAccessError] = useState("");
  const [isChangingAccess, setIsChangingAccess] = useState(false);
  const [actionMenu, setActionMenu] = useState(null);
  const actionMenuTriggerRef = useRef(null);
  const [emailAdmin, setEmailAdmin] = useState(null);
  const [emailForm, setEmailForm] = useState({ email: "", password: "" });
  const [emailError, setEmailError] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [deleteAdmin, setDeleteAdmin] = useState(null);
  const [deleteForm, setDeleteForm] = useState({
    password: "",
    confirmation: "",
  });
  const [deleteError, setDeleteError] = useState("");
  const [isDeletingAdmin, setIsDeletingAdmin] = useState(false);

  const loadAdmins = useCallback(async () => {
    if (!canManageAdmins) return;

    setError("");
    setAdmins(null);

    try {
      const result = await api.listAdmins({ page: 1, limit: 100 });
      setAdmins(result.admins);
    } catch (err) {
      setError(err.message);
    }
  }, [api, canManageAdmins]);

  useEffect(() => {
    if (canManageAdmins) {
      loadAdmins();
    }
  }, [canManageAdmins, loadAdmins]);

  useEffect(() => {
    if (!actionMenu) return;
    document
      .getElementById(`admin-action-menu-${actionMenu.item.id}`)
      ?.querySelector("button")
      ?.focus();
  }, [actionMenu]);

  const closeActionMenu = (restoreFocus = false) => {
    setActionMenu(null);
    if (restoreFocus) actionMenuTriggerRef.current?.focus();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (formError) setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setSuccess("");

    const validationError = validateAdminForm(form);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        accessLevel: form.accessLevel,
      };

      const result = await api.createAdmin(payload);

      setAdmins((current) => [
        { ...result.admin, accessLevel: result.admin.accessLevel || payload.accessLevel },
        ...(current || []),
      ]);
      setSuccess(result.message || "Admin account created successfully.");
      setForm(EMPTY_FORM);
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAccessDialog = (item) => {
    setAccessAdmin(item);
    setSelectedAccessLevel(item.accessLevel);
    setAccessError("");
  };

  const closeAccessDialog = () => {
    if (isChangingAccess) return;
    setAccessAdmin(null);
    setAccessError("");
  };

  const handleAccessUpdate = async (event) => {
    event.preventDefault();
    if (!accessAdmin || selectedAccessLevel === accessAdmin.accessLevel) return;

    setIsChangingAccess(true);
    setAccessError("");
    setError("");
    setSuccess("");

    try {
      const result = await api.updateAdminAccess(
        accessAdmin.id,
        selectedAccessLevel
      );
      setAdmins((current) =>
        current.map((item) =>
          item.id === result.admin.id ? result.admin : item
        )
      );
      setSuccess(
        `${accessAdmin.fullName || accessAdmin.email} now has ${
          selectedAccessLevel === "full" ? "Full Access" : "Standard Access"
        }.`
      );
      setAccessAdmin(null);
      try {
        const refreshed = await api.listAdmins({ page: 1, limit: 100 });
        setAdmins(refreshed.admins);
      } catch (refreshError) {
        setError(
          `Access was updated, but the admin list could not be refreshed: ${refreshError.message}`
        );
      }
    } catch (err) {
      setAccessError(err.message);
    } finally {
      setIsChangingAccess(false);
    }
  };

  const openEmailDialog = (item) => {
    closeActionMenu();
    setEmailAdmin(item);
    setEmailForm({ email: item.email || "", password: "" });
    setEmailError("");
  };

  const closeEmailDialog = () => {
    if (isUpdatingEmail) return;
    setEmailAdmin(null);
    setEmailForm({ email: "", password: "" });
    setEmailError("");
  };

  const handleEmailUpdate = async (event) => {
    event.preventDefault();
    setEmailError("");

    const normalizedEmail = emailForm.email.trim().toLowerCase();
    if (
      normalizedEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      setEmailError("Enter a valid email address.");
      return;
    }
    if (!emailForm.password) {
      setEmailError("Enter your password to confirm this change.");
      return;
    }

    setIsUpdatingEmail(true);
    try {
      const result = await api.updateAdminEmail(emailAdmin.id, {
        email: normalizedEmail,
        password: emailForm.password,
      });
      setSuccess(result.message || "Verification link sent to the new email.");
      setEmailAdmin(null);
      setEmailForm({ email: "", password: "" });
      setActionMenu(null);
      try {
        const refreshed = await api.listAdmins({ page: 1, limit: 100 });
        setAdmins(refreshed.admins);
      } catch (refreshError) {
        setError(
          `Verification was requested, but the admin list could not be refreshed: ${refreshError.message}`
        );
      }
    } catch (err) {
      setEmailError(err.message);
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const openDeleteDialog = (item) => {
    closeActionMenu();
    setDeleteAdmin(item);
    setDeleteForm({ password: "", confirmation: "" });
    setDeleteError("");
  };

  const closeDeleteDialog = () => {
    if (isDeletingAdmin) return;
    setDeleteAdmin(null);
    setDeleteForm({ password: "", confirmation: "" });
    setDeleteError("");
  };

  const handleAdminDeactivation = async (event) => {
    event.preventDefault();
    setDeleteError("");

    if (deleteForm.confirmation !== "DELETE") {
      setDeleteError('Type "DELETE" exactly to confirm deactivation.');
      return;
    }
    if (!deleteForm.password) {
      setDeleteError("Enter your password to confirm this action.");
      return;
    }

    setIsDeletingAdmin(true);
    try {
      const result = await api.deactivateAdmin(deleteAdmin.id, {
        password: deleteForm.password,
        confirmation: deleteForm.confirmation,
      });
      setAdmins((current) =>
        (current || []).map((item) =>
          item.id === deleteAdmin.id
            ? { ...item, status: "deactivated" }
            : item
        )
      );
      setSuccess(result.message || "Admin account deactivated.");
      setDeleteAdmin(null);
      setDeleteForm({ password: "", confirmation: "" });
      try {
        const refreshed = await api.listAdmins({ page: 1, limit: 100 });
        setAdmins(refreshed.admins);
      } catch (refreshError) {
        setError(
          `Admin was deactivated, but the table could not be refreshed: ${refreshError.message}`
        );
      }
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setIsDeletingAdmin(false);
    }
  };

  if (!canManageAdmins) {
    return (
      <section className="card">
        <div className="state state-error">
          <ShieldAlert size={28} aria-hidden="true" />
          <strong>Access restricted</strong>
          <p>
            Only admins with the <code>manageAdmins</code> permission can view or manage other admin accounts.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Admin Management</h2>
            <p className="muted">Manage administrator accounts and access permissions.</p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} aria-hidden="true" />
            Add admin
          </button>
        </div>

        {success && (
          <div className="notice success-note" role="status">
            <CheckCircle2 size={16} aria-hidden="true" />
            {success}
          </div>
        )}

        {error ? (
          <ErrorState message={error} onRetry={loadAdmins} />
        ) : !admins ? (
          <LoadingState label="Loading admin accounts…" />
        ) : admins.length === 0 ? (
          <EmptyState
            title="No admin accounts found"
            message="Create the first admin account to start managing the dashboard."
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Admin</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Permission</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.fullName || "Not provided"}</strong>
                    </td>
                    <td>
                      <span className="admin-email-value">{item.email}</span>
                      <span
                        className={`badge ${
                          item.pendingEmail
                            ? "badge-warning"
                            : item.isEmailVerified
                              ? "badge-success"
                              : "badge-warning"
                        }`}
                      >
                        {item.pendingEmail
                          ? "Verification pending"
                          : item.isEmailVerified
                            ? "Verified"
                            : "Unverified"}
                      </span>
                      {item.pendingEmail && (
                        <span className="admin-pending-email">
                          New: {item.pendingEmail}
                        </span>
                      )}
                    </td>
                    <td>
                      <StatusBadge value={item.status} />
                    </td>
                    <td>
                      {item.accessLevel === "full" ? (
                        <span className="badge badge-brand">
                          <ShieldCheck size={12} aria-hidden="true" />
                          Full access
                        </span>
                      ) : (
                        <span className="badge badge-neutral">Standard access</span>
                      )}
                    </td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td className="cell-actions">
                      <div className="action-row" style={{ justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm admin-action-trigger"
                          aria-label={`More actions for ${item.fullName || item.email}`}
                          ref={actionMenuTriggerRef}
                          onClick={() =>
                            setActionMenu((current) =>
                              current?.item.id === item.id ? null : { item }
                            )
                          }
                        >
                          <MoreVertical size={16} aria-hidden="true" />
                        </button>
                      </div>
                      {actionMenu?.item.id === item.id &&
                        createPortal(
                          <>
                            <button
                              type="button"
                              className="admin-action-dismiss"
                              aria-label="Close action menu"
                              onClick={() => closeActionMenu(false)}
                            />
                            <div
                              id={`admin-action-menu-${item.id}`}
                              className="admin-action-menu"
                              role="menu"
                              aria-label={`Actions for ${item.fullName || item.email}`}
                              style={{
                                left: window.innerWidth < 768 ? 16 : undefined,
                                top: window.innerWidth < 768 ? 100 : undefined,
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => openAccessDialog(item)}
                                role="menuitem"
                              >
                                <Shield size={16} aria-hidden="true" />
                                Change access
                              </button>
                              <button
                                type="button"
                                onClick={() => openEmailDialog(item)}
                                role="menuitem"
                              >
                                <UserPlus size={16} aria-hidden="true" />
                                Edit email
                              </button>
                              <button
                                type="button"
                                onClick={() => openDeleteDialog(item)}
                                className="admin-action-destructive"
                                role="menuitem"
                              >
                                <Trash2 size={16} aria-hidden="true" />
                                Delete admin
                              </button>
                            </div>
                          </>,
                          document.body
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isModalOpen && (
        <Modal
          title="Add admin"
          onClose={() => {
            if (isSubmitting) return;
            setIsModalOpen(false);
            setFormError("");
          }}
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={isSubmitting}
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="create-admin-form"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating…" : "Create admin"}
              </button>
            </>
          }
        >
          <form id="create-admin-form" className="form" onSubmit={handleSubmit} noValidate>
            <label className="field">
              <span>Full name</span>
              <input
                type="text"
                name="fullName"
                autoComplete="name"
                value={form.fullName}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </label>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </label>
            <label className="field">
              <span>Confirm password</span>
              <input
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </label>
            <label className="field">
              <span>Access level</span>
              <select
                name="accessLevel"
                value={form.accessLevel}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="standard">Standard Access</option>
                <option value="full">Full Access</option>
              </select>
            </label>
            <p className="muted small">
              Standard Access is the default. Full Access also allows managing other admin accounts.
            </p>
            {formError && <p className="form-error" role="alert">{formError}</p>}
          </form>
        </Modal>
      )}

      {accessAdmin && (
        <Modal
          title="Change admin access"
          onClose={closeAccessDialog}
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={isChangingAccess}
                onClick={closeAccessDialog}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="change-admin-access-form"
                className="btn btn-primary"
                disabled={
                  isChangingAccess ||
                  selectedAccessLevel === accessAdmin.accessLevel
                }
              >
                {isChangingAccess ? "Updating…" : "Save changes"}
              </button>
            </>
          }
        >
          <form id="change-admin-access-form" className="form" onSubmit={handleAccessUpdate} noValidate>
            <p>
              Update access for <strong>{accessAdmin.fullName || accessAdmin.email}</strong>.
            </p>
            <label className="field">
              <span>Permission</span>
              <select
                value={selectedAccessLevel}
                onChange={(event) => setSelectedAccessLevel(event.target.value)}
                disabled={isChangingAccess}
              >
                <option value="standard">Standard Access</option>
                <option value="full">Full Access</option>
              </select>
            </label>
            <p className="muted small">
              {accessAdmin.accessLevel === "full"
                ? "Full Access allows this admin to create admins and change admin access levels."
                : "Standard Access keeps normal dashboard access but removes Admin Management privileges."}
            </p>
            {accessAdmin.accessLevel === "full" && (
              <p className="inline-note destructive-note">
                {accessAdmin.email === admin?.email
                  ? "You cannot remove your own Full Access."
                  : "This admin currently has Full Access."}
              </p>
            )}
            {accessError && <p className="form-error" role="alert">{accessError}</p>}
          </form>
        </Modal>
      )}

      {emailAdmin && (
        <Modal
          title="Edit admin email"
          onClose={closeEmailDialog}
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={isUpdatingEmail}
                onClick={closeEmailDialog}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="update-admin-email-form"
                className="btn btn-primary"
                disabled={isUpdatingEmail}
              >
                {isUpdatingEmail ? "Sending…" : "Send verification"}
              </button>
            </>
          }
        >
          <form id="update-admin-email-form" className="form" onSubmit={handleEmailUpdate} noValidate>
            <label className="field">
              <span>New email address</span>
              <input
                type="email"
                autoFocus
                value={emailForm.email}
                onChange={(event) =>
                  setEmailForm((current) => ({ ...current, email: event.target.value }))
                }
                disabled={isUpdatingEmail}
                required
              />
            </label>
            <label className="field">
              <span>Current password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={emailForm.password}
                onChange={(event) =>
                  setEmailForm((current) => ({ ...current, password: event.target.value }))
                }
                disabled={isUpdatingEmail}
                required
              />
            </label>
            {emailError && <p className="form-error" role="alert">{emailError}</p>}
          </form>
        </Modal>
      )}

      {deleteAdmin && (
        <Modal
          title="Deactivate admin"
          onClose={closeDeleteDialog}
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={isDeletingAdmin}
                onClick={closeDeleteDialog}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="deactivate-admin-form"
                className="btn btn-danger"
                disabled={
                  isDeletingAdmin ||
                  deleteForm.confirmation !== "DELETE" ||
                  !deleteForm.password
                }
              >
                {isDeletingAdmin ? "Deactivating…" : "Deactivate admin"}
              </button>
            </>
          }
        >
          <form id="deactivate-admin-form" className="form" onSubmit={handleAdminDeactivation} noValidate>
            <p>
              Deactivate this admin account: <strong>{deleteAdmin.fullName || deleteAdmin.email}</strong>
            </p>
            <div className="inline-note destructive-note">
              This disables the admin’s dashboard access immediately. The last active Full Access account cannot be deactivated.
            </div>
            <label className="field">
              <span>Type DELETE to confirm</span>
              <input
                type="text"
                autoComplete="off"
                value={deleteForm.confirmation}
                onChange={(event) =>
                  setDeleteForm((current) => ({
                    ...current,
                    confirmation: event.target.value,
                  }))
                }
                disabled={isDeletingAdmin}
                required
              />
            </label>
            <label className="field">
              <span>Current password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={deleteForm.password}
                onChange={(event) =>
                  setDeleteForm((current) => ({ ...current, password: event.target.value }))
                }
                disabled={isDeletingAdmin}
                required
              />
            </label>
            {deleteError && <p className="form-error" role="alert">{deleteError}</p>}
          </form>
        </Modal>
      )}
    </>
  );
};

export default SettingsAdminPage;
