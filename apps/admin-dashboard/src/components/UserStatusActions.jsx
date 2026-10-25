import { useState } from "react";

import Modal from "./Modal";
import { useAdminApi } from "../services/admin.service";

// Account status changes allowed for each current status.
const ACTIONS = {
  active: [
    { status: "suspended", label: "Suspend", tone: "danger" },
    { status: "disabled", label: "Disable", tone: "secondary" },
  ],
  suspended: [{ status: "active", label: "Activate", tone: "success" }],
  disabled: [{ status: "active", label: "Activate", tone: "success" }],
};

const DESCRIPTIONS = {
  suspended:
    "The user is logged out immediately and cannot log in until reactivated.",
  disabled:
    "The account is turned off. Use this for closed or abandoned accounts.",
  active: "The user will be able to log in and use the app again.",
};

// Activate / suspend / disable a passenger or driver account.
const UserStatusActions = ({ user, onUpdated, compact = false }) => {
  const api = useAdminApi();
  const [pending, setPending] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const actions = ACTIONS[user.status];

  if (!actions) {
    return <span className="muted small">Registration incomplete</span>;
  }

  const close = () => {
    if (isSaving) return;
    setPending(null);
    setError("");
  };

  const confirm = async () => {
    setIsSaving(true);
    setError("");

    try {
      const result = await api.updateUserStatus(user.id, pending.status);
      onUpdated?.(result.user);
      setPending(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="action-row">
        {actions.map((action) => (
          <button
            key={action.status}
            type="button"
            className={`btn btn-${action.tone}${compact ? " btn-sm" : ""}`}
            onClick={() => setPending(action)}
          >
            {action.label}
          </button>
        ))}
      </div>

      {pending && (
        <Modal
          title={`${pending.label} account?`}
          onClose={close}
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={close}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn btn-${pending.tone}`}
                onClick={confirm}
                disabled={isSaving}
              >
                {isSaving ? "Saving…" : pending.label}
              </button>
            </>
          }
        >
          <p>
            <strong>{user.fullName || user.phone || user.email}</strong> (
            {user.role})
          </p>
          <p className="muted">{DESCRIPTIONS[pending.status]}</p>
          {error && <p className="form-error">{error}</p>}
        </Modal>
      )}
    </>
  );
};

export default UserStatusActions;
