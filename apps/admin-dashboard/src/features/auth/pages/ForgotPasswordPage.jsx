import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

import logo from "../../../assets/logo.png";
import { requestPasswordReset } from "../services/password-reset.service";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await requestPasswordReset(email.trim());
      setIsSubmitted(true);
      setError("");
      return result;
    } catch (requestError) {
      setError(requestError.message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-card auth-card">
        <img src={logo} alt="Saheli Safar" className="login-logo" />
        {isSubmitted ? (
          <>
            <h1>Check your email</h1>
            <p className="muted" role="status" aria-live="polite">
              If an administrator account exists for this email, you will
              receive a password-reset link. Check your inbox and spam folder.
            </p>
            <Link className="btn btn-primary btn-block auth-back-button" to="/login">
              Back to Login
            </Link>
          </>
        ) : (
          <>
            <h1>Forgot your password?</h1>
            <p className="muted">
              Enter your registered email address and we'll send you a secure
              link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="form" noValidate>
              <label className="field">
                <span>Email</span>
                <div className="input-icon">
                  <Mail size={16} aria-hidden="true" />
                  <input
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@sahelisafar.com"
                    maxLength={254}
                    required
                  />
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
                disabled={isSubmitting || !email.trim()}
              >
                {isSubmitting ? "Sending…" : "Send Reset Link"}
              </button>
            </form>

            <Link className="auth-text-link" to="/login">
              Back to Login
            </Link>
          </>
        )}
      </section>
    </div>
  );
};

export default ForgotPasswordPage;
