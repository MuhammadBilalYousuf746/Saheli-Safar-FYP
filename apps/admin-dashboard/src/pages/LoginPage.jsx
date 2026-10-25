import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";

import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || "/";

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({ email: email.trim(), password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <img src={logo} alt="Saheli Safar" className="login-logo" />
        <h1>Admin Panel</h1>
        <p className="muted">Sign in to manage drivers and users.</p>

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
                required
              />
            </div>
          </label>

          <label className="field">
            <span>Password</span>
            <div className="input-icon">
              <Lock size={16} aria-hidden="true" />
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </label>

          <div className="forgot-password-row">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting || !email || !password}
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {location.state?.passwordChanged && (
          <p className="notice success-note login-success" role="status">
            Your password has been changed successfully. Please sign in again.
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
