import { capitalize } from "../utils/format";

// Maps backend status values to badge colors.
const TONES = {
  // Driver verification
  approved: "success",
  rejected: "error",

  // Account status
  active: "success",
  pending: "warning",
  suspended: "error",
  disabled: "neutral",
  deactivated: "neutral",

  // Roles
  passenger: "info",
  driver: "brand",
  admin: "brand",
};

const StatusBadge = ({ value, label }) => (
  <span className={`badge badge-${TONES[value] || "neutral"}`}>
    {label || capitalize(value)}
  </span>
);

export default StatusBadge;
