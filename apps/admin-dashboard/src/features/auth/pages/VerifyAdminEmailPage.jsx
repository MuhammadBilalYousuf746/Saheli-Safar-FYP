import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../../shared/api/api";

import logo from "../../../assets/logo.png";

const readToken = () =>
  new URLSearchParams(window.location.search).get("token") || "";

const VerifyAdminEmailPage = () => {
  const [result, setResult] = useState({
    loading: true,
    message: "",
    error: false,
  });

  useEffect(() => {
    const token = readToken();
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname
    );

    if (!token) {
      setResult({
        loading: false,
        message: "This email verification link is invalid or has expired.",
        error: true,
      });
      return;
    }

    let cancelled = false;
    apiRequest("/admin/auth/verify-email-change", {
      method: "POST",
      body: { token },
    })
      .then((response) => {
        if (!cancelled) {
          setResult({
            loading: false,
            message: response.message,
            error: false,
          });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setResult({
            loading: false,
            message: error.message,
            error: true,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="login-page">
      <section className="login-card auth-card">
        <img src={logo} alt="Saheli Safar" className="login-logo" />
        <h1>{result.loading ? "Verifying email address…" : "Email verification"}</h1>
        {!result.loading && (
          <>
            <p
              className={result.error ? "form-error" : "muted"}
              role={result.error ? "alert" : "status"}
            >
              {result.message}
            </p>
            <Link className="btn btn-primary btn-block auth-back-button" to="/login">
              Back to Login
            </Link>
          </>
        )}
      </section>
    </div>
  );
};

export default VerifyAdminEmailPage;
