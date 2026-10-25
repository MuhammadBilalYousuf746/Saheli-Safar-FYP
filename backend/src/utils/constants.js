
// Shared account roles and statuses.
export const ROLES = ["passenger", "driver", "admin"];

// Roles that self-register with email OTP and complete a profile.
export const APP_ROLES = ["passenger", "driver"];

export const USER_STATUSES = [
  "pending",
  "active",
  "suspended",
  "disabled",
  "deactivated",
];

export const DRIVER_VERIFICATION_STATUSES = [
  "pending",
  "approved",
  "rejected",
];

export const VEHICLE_TYPES = ["car", "bike", "rickshaw"];

// Website contact form topics.
export const CONTACT_TOPICS = [
  "general",
  "passenger",
  "driver",
  "partnership",
  "feedback",
];

// Normalized Pakistani mobile number: +923XXXXXXXXX
export const PHONE_REGEX = /^\+923[0-9]{9}$/;

export const isValidPhone = (phone) =>
  typeof phone === "string" && PHONE_REGEX.test(phone);

// Lowercase, trimmed email address.
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email) =>
  typeof email === "string" &&
  email.length <= 254 &&
  email === email.trim().toLowerCase() &&
  EMAIL_REGEX.test(email);
