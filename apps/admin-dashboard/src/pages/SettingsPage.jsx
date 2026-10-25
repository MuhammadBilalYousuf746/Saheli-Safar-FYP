import { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Mail,
  MoreVertical,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserPlus,
} from "lucide-react";
import { createPortal } from "react-dom";

import Modal from "../components/Modal";
import AdminAccountSection from "../components/AdminAccountSection";
import ChangePasswordForm from "../components/ChangePasswordForm";
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

const SettingsPage = () => {
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
      <div className="page">
        <header className="page-header">
          <div>
            <h1>Settings</h1>
            <p className="muted">Account and access controls.</p>
          </div>
        </header>

        <AdminAccountSection />
        <ChangePasswordForm />

        <section className="card">
          <div className="state state-error">
            <ShieldAlert size={28} aria-hidden="true" />
            <strong>Access restricted</strong>
            <p>
              Only admins with the <code>manageAdmins</code> permission can view or manage other admin accounts.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="muted">Manage access, permissions, and administrator accounts.</p>
        </div>
      </header>

      <AdminAccountSection />
      <ChangePasswordForm />

      <section className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Admin Management</h2>
            <p className="muted">Create additional admin accounts for the dashboard.</p>
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
                        <span className="badge badge-neutral">Standard admin</span>
                      )}
                    </td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-icon btn-plain admin-action-trigger"
                        aria-label={`Actions for ${item.fullName || item.email}`}
                        aria-haspopup="menu"
                        aria-expanded={actionMenu?.item.id === item.id}
                        aria-controls={`admin-action-menu-${item.id}`}
                        onClick={(event) => {
                          if (actionMenu?.item.id === item.id) {
                            closeActionMenu();
                            return;
                          }
                          const bounds =
                            event.currentTarget.getBoundingClientRect();
                          actionMenuTriggerRef.current = event.currentTarget;
                          setActionMenu({
                            item,
                            top: Math.min(bounds.bottom + 4, window.innerHeight - 150),
                            left: Math.max(
                              8,
                              Math.min(
                                bounds.right - 184,
                                window.innerWidth - 192
                              )
                            ),
                          });
                        }}
                      >
                        <MoreVertical size={18} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {actionMenu &&
        createPortal(
          <>
            <button
              type="button"
              className="admin-action-dismiss"
              aria-label="Close admin actions"
              onClick={() => closeActionMenu(true)}
            />
            <div
              id={`admin-action-menu-${actionMenu.item.id}`}
              className="admin-action-menu"
              role="menu"
              aria-label={`Actions for ${actionMenu.item.fullName || actionMenu.item.email}`}
              style={{ top: actionMenu.top, left: actionMenu.left }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  closeActionMenu(true);
                  return;
                }

                const items = [
                  ...event.currentTarget.querySelectorAll(
                    "button:not(:disabled)"
                  ),
                ];
                const currentIndex = items.indexOf(document.activeElement);

                if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                  event.preventDefault();
                  const direction = event.key === "ArrowDown" ? 1 : -1;
                  const nextIndex =
                    (currentIndex + direction + items.length) % items.length;
                  items[nextIndex]?.focus();
                } else if (event.key === "Home") {
                  event.preventDefault();
                  items[0]?.focus();
                } else if (event.key === "End") {
                  event.preventDefault();
                  items.at(-1)?.focus();
                }
              }}
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  closeActionMenu();
                  openAccessDialog(actionMenu.item);
                }}
              >
                <Shield size={16} aria-hidden="true" />
                Change Access
              </button>
              <button
                type="button"
                role="menuitem"
                disabled={
                  actionMenu.item.id === admin?.id ||
                  actionMenu.item.status !== "active"
                }
                title={
                  actionMenu.item.id === admin?.id
                    ? "You cannot change your own email here."
                    : actionMenu.item.status !== "active"
                      ? "Only active admin accounts can change email."
                      : undefined
                }
                onClick={() => openEmailDialog(actionMenu.item)}
              >
                <Mail size={16} aria-hidden="true" />
                Edit Email
              </button>
              <button
                type="button"
                role="menuitem"
                className="admin-action-destructive"
                disabled={
                  actionMenu.item.id === admin?.id ||
                  actionMenu.item.status !== "active"
                }
                title={
                  actionMenu.item.id === admin?.id
                    ? "You cannot deactivate your own account."
                    : actionMenu.item.status !== "active"
                      ? "This admin account is already inactive."
                      : undefined
                }
                onClick={() => openDeleteDialog(actionMenu.item)}
              >
                <Trash2 size={16} aria-hidden="true" />
                Delete Admin
              </button>
            </div>
          </>,
          document.body
        )}

      {isModalOpen && (
        <Modal
          title="Add Admin"
          onClose={() => {
            setIsModalOpen(false);
            setForm(EMPTY_FORM);
            setFormError("");
          }}
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  setForm(EMPTY_FORM);
                  setFormError("");
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-admin-form"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating…" : "Create Admin"}
              </button>
            </>
          }
        >
          <form
            id="add-admin-form"
            className="form"
            onSubmit={handleSubmit}
            noValidate
          >
            <label className="field">
              <span>Full name</span>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Full name"
                autoComplete="name"
              />
            </label>

            <label className="field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@sahelisafar.com"
                autoComplete="username"
              />
            </label>

            <label className="field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a secure password"
                autoComplete="new-password"
              />
            </label>

            <label className="field">
              <span>Confirm password</span>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                autoComplete="new-password"
              />
            </label>

            <label className="field">
              <span>Access level</span>
              <select
              name="accessLevel"
              value={form.accessLevel}
              onChange={handleChange}
              required
              >
              <option value="standard">Standard Access</option>
              <option value="full">Full Access</option>
              </select>
            </label>

            <p className="muted small">
              Standard Access is the default. Full Access also allows managing
              admin accounts and access levels.
            </p>

            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}

            <div className="inline-note">
              <UserPlus size={16} aria-hidden="true" />
              The new admin can sign in using this email and password immediately.
            </div>
          </form>
        </Modal>
      )}

      {accessAdmin && (
        <Modal
          title="Change Admin Access"
          onClose={closeAccessDialog}
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeAccessDialog}
                disabled={isChangingAccess}
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
                {isChangingAccess ? "Updating…" : "Confirm change"}
              </button>
            </>
          }
        >
          <form
            id="change-admin-access-form"
            className="form"
            onSubmit={handleAccessUpdate}
          >
            <p>
              Change access for <strong>{accessAdmin.fullName || accessAdmin.email}</strong>.
            </p>

            <label className="field">
              <span>New access level</span>
              <select
                autoFocus
                value={selectedAccessLevel}
                onChange={(event) => setSelectedAccessLevel(event.target.value)}
                disabled={isChangingAccess}
              >
                <option
                  value="standard"
                  disabled={
                    accessAdmin.id === admin?.id &&
                    accessAdmin.accessLevel === "full"
                  }
                >
                  Standard Access
                </option>
                <option value="full">Full Access</option>
              </select>
            </label>

            <div className="inline-note" role="status">
              Confirm change from{" "}
              <strong>
                {accessAdmin.accessLevel === "full"
                  ? "Full Access"
                  : "Standard Access"}
              </strong>{" "}
              to{" "}
              <strong>
                {selectedAccessLevel === "full"
                  ? "Full Access"
                  : "Standard Access"}
              </strong>
              ?
            </div>

            <p className="muted small">
              {accessAdmin.id === admin?.id &&
              selectedAccessLevel === "standard"
                ? "You cannot remove your own Full Access."
                : selectedAccessLevel === "full"
                  ? "Full Access allows this admin to create admins and change admin access levels."
                  : "Standard Access keeps normal dashboard access but removes Admin Management privileges."}
            </p>

            {accessError && (
              <p className="form-error" role="alert">
                {accessError}
              </p>
            )}
          </form>
        </Modal>
      )}

      {emailAdmin && (
        <Modal
          title="Edit Admin Email"
          onClose={closeEmailDialog}
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeEmailDialog}
                disabled={isUpdatingEmail}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-admin-email-form"
                className="btn btn-primary"
                disabled={isUpdatingEmail}
              >
                {isUpdatingEmail ? "Sending…" : "Confirm email change"}
              </button>
            </>
          }
        >
          <form
            id="edit-admin-email-form"
            className="form"
            onSubmit={handleEmailUpdate}
            noValidate
          >
            <p>
              Change the email address for{" "}
              <strong>{emailAdmin.fullName || emailAdmin.email}</strong>.
            </p>
            <label className="field">
              <span>Current email</span>
              <input type="email" value={emailAdmin.email || ""} readOnly />
            </label>
            <label className="field">
              <span>New email address</span>
              <input
                type="email"
                autoFocus
                autoComplete="email"
                value={emailForm.email}
                onChange={(event) =>
                  setEmailForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                disabled={isUpdatingEmail}
                required
              />
            </label>
            <label className="field">
              <span>Your password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={emailForm.password}
                onChange={(event) =>
                  setEmailForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                disabled={isUpdatingEmail}
                required
              />
            </label>
            <div className="inline-note">
              A verification link will be sent to the new address. The current
              email remains active until verification succeeds.
            </div>
            {emailError && (
              <p className="form-error" role="alert">
                {emailError}
              </p>
            )}
          </form>
        </Modal>
      )}

      {deleteAdmin && (
        <Modal
          title="Deactivate Admin Account"
          onClose={closeDeleteDialog}
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeDeleteDialog}
                disabled={isDeletingAdmin}
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
                {isDeletingAdmin ? "Deactivating…" : "Confirm deactivation"}
              </button>
            </>
          }
        >
          <form
            id="deactivate-admin-form"
            className="form"
            onSubmit={handleAdminDeactivation}
            noValidate
          >
            <p>
              Deactivate{" "}
              <strong>
                {deleteAdmin.fullName || "this admin"}
              </strong>{" "}
              ({deleteAdmin.email})?
            </p>
            <div className="inline-note destructive-note">
              This revokes dashboard access immediately and signs out existing
              sessions. The account and its historical records are retained.
            </div>
            <label className="field">
              <span>Type DELETE to confirm</span>
              <input
                type="text"
                autoFocus
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
              <span>Your password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={deleteForm.password}
                onChange={(event) =>
                  setDeleteForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                disabled={isDeletingAdmin}
                required
              />
            </label>
            {deleteError && (
              <p className="form-error" role="alert">
                {deleteError}
              </p>
            )}
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SettingsPage;
