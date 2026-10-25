import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useAdminApi } from "../services/admin.service";

const ChangePasswordForm = () => {
  const api = useAdminApi();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.changePassword({
        currentPassword,
        password,
        confirmPassword,
      });
      logout();
      navigate("/login", {
        replace: true,
        state: { passwordChanged: true },
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Security</h2>
          <p className="muted">
            Change your password. You’ll need to sign in again on all devices.
          </p>
        </div>
      </div>

      <form className="form change-password-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Current Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>New Password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Confirm New Password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </label>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={
              isSubmitting ||
              !currentPassword ||
              !password ||
              !confirmPassword
            }
          >
            {isSubmitting ? "Updating…" : "Change Password"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default ChangePasswordForm;
