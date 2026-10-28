import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Lock } from "lucide-react";

import logo from "../../../assets/logo.png";
import { resetPassword } from "../services/password-reset.service";

const readResetToken = () =>
  new URLSearchParams(window.location.search).get("token") || "";

const isStrongPassword = (password) =>
  password.length >= 8 &&
  new TextEncoder().encode(password).length <= 72 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password);

const ResetPasswordPage = () => {
  const [token] = useState(readResetToken);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (window.location.search) {
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname
      );
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("This password reset link is invalid or has expired.");
      return;
    }

    if (!isStrongPassword(password)) {
      setError(
        "Use at least 8 characters, including uppercase and lowercase letters and a number. Passwords must be 72 bytes or fewer."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword({ token, password, confirmPassword });
      setIsSubmitted(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasExpiredLink = !token || /invalid or has expired/i.test(error);

  return (
    <div className="login-page">
      <section className="login-card auth-card">
        <img src={logo} alt="Saheli Safar" className="login-logo" />
        {isSubmitted ? (
          <>
            <h1>Password reset complete</h1>
            <p className="muted" role="status" aria-live="polite">
              Your password has been reset successfully.
            </p>
            <Link className="btn btn-primary btn-block auth-back-button" to="/login">
              Back to Login
            </Link>
          </>
        ) : (
          <>
            <h1>Create a New Password</h1>
            <p className="muted">
              Choose a secure password for your Saheli Safar Admin account.
            </p>

            {hasExpiredLink ? (
              <div className="auth-link-error">
                <p className="form-error" role="alert">
                  {error || "This password reset link is invalid or has expired."}
                </p>
                <Link
                  className="btn btn-primary btn-block auth-back-button"
                  to="/forgot-password"
                >
                  Request another reset link
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="form" noValidate>
                <label className="field">
                  <span>New Password</span>
                  <div className="input-icon password-control">
                    <Lock size={16} aria-hidden="true" />
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      aria-describedby="password-requirements"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((visible) => !visible)}
                    >
                      {showPassword ? (
                        <EyeOff size={18} aria-hidden="true" />
                      ) : (
                        <Eye size={18} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </label>

                <ul className="password-requirements" id="password-requirements">
                  <li>At least 8 characters</li>
                  <li>Uppercase and lowercase letters</li>
                  <li>At least one number; no more than 72 UTF-8 bytes</li>
                </ul>

                <label className="field">
                  <span>Confirm New Password</span>
                  <div className="input-icon password-control">
                    <Lock size={16} aria-hidden="true" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirmation password"
                          : "Show confirmation password"
                      }
                      onClick={() =>
                        setShowConfirmPassword((visible) => !visible)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} aria-hidden="true" />
                      ) : (
                        <Eye size={18} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </label>

                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={isSubmitting || !password || !confirmPassword}
                >
                  {isSubmitting ? "Updating…" : "Reset Password"}
                </button>
                <Link className="auth-text-link" to="/login">
                  Back to Login
                </Link>
              </form>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default ResetPasswordPage;
