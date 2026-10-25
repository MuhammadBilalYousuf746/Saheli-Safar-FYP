import { AlertCircle, Inbox, RefreshCw } from "lucide-react";

export const LoadingState = ({ label = "Loading…", fullPage = false }) => (
  <div className={`state${fullPage ? " state-full" : ""}`} role="status">
    <span className="spinner" aria-hidden="true" />
    <p>{label}</p>
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="state state-error" role="alert">
    <AlertCircle size={28} aria-hidden="true" />
    <p>{message}</p>
    {onRetry && (
      <button type="button" className="btn btn-secondary" onClick={onRetry}>
        <RefreshCw size={16} aria-hidden="true" />
        Try again
      </button>
    )}
  </div>
);

export const EmptyState = ({ title, message }) => (
  <div className="state">
    <Inbox size={28} aria-hidden="true" />
    <strong>{title}</strong>
    {message && <p>{message}</p>}
  </div>
);
