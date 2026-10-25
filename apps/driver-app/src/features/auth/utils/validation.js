// ==========================================
// DRIVER FORM VALIDATION
// Mirrors backend/src/modules/auth/auth.validation.js and
// backend/src/modules/driver/driver.validation.js so errors
// show before the request is sent.
// ==========================================

export const VEHICLE_TYPES = [
  { value: "car", label: "Car" },
  { value: "bike", label: "Bike" },
  { value: "rickshaw", label: "Rickshaw" },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateFullName = (value) =>
  value.trim().length < 2 ? "Please enter your full name." : "";

export const validateEmail = (value) =>
  EMAIL_REGEX.test(value.trim()) ? "" : "Please enter a valid email address.";

// "3001234567" (10 digits after +92)
export const validatePhoneDigits = (digits) =>
  /^3\d{9}$/.test(digits)
    ? ""
    : "Enter a valid Pakistani mobile number.";

export const validatePassword = (password) =>
  password.length < 8 ||
  !/[A-Z]/.test(password) ||
  !/[a-z]/.test(password) ||
  !/\d/.test(password)
    ? "Use 8+ characters, uppercase, lowercase and a number."
    : "";

// Accepts "3520212345671" or "35202-1234567-1".
export const validateCnic = (value) =>
  /^\d{5}-?\d{7}-?\d$/.test(value.trim())
    ? ""
    : "Enter your 13-digit CNIC number.";

// Formats digits as XXXXX-XXXXXXX-X while typing.
export const formatCnic = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 13);

  if (digits.length <= 5) return digits;
  if (digits.length <= 12) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
};

export const validateLicense = (value) =>
  /^[A-Z0-9-]{5,20}$/.test(value.trim().toUpperCase())
    ? ""
    : "Enter a valid license number (5-20 letters, numbers or dashes).";

export const validateVehicle = ({ type, make, model, color, year, plateNumber }) => {
  const errors = {};
  const currentYear = new Date().getFullYear();
  const yearNumber = Number(year);

  if (!VEHICLE_TYPES.some((option) => option.value === type)) {
    errors.type = "Choose your vehicle type.";
  }

  if (make.trim().length < 2) {
    errors.make = "Enter the vehicle make, e.g. Suzuki.";
  }

  if (model.trim().length < 1) {
    errors.model = "Enter the vehicle model, e.g. Alto.";
  }

  if (color.trim().length < 2) {
    errors.color = "Enter the vehicle color.";
  }

  if (
    !Number.isInteger(yearNumber) ||
    yearNumber < 1980 ||
    yearNumber > currentYear + 1
  ) {
    errors.year = `Enter a year between 1980 and ${currentYear + 1}.`;
  }

  if (!/^[A-Z0-9 -]{2,15}$/.test(plateNumber.trim().toUpperCase())) {
    errors.plateNumber = "Enter a valid plate number, e.g. LEA-1234.";
  }

  return errors;
};

// Login field: email OR Pakistani mobile number.
// Returns { email } or { phone } or null.
export const parseLoginIdentifier = (value) => {
  const text = value.trim();

  if (text.includes("@")) {
    return EMAIL_REGEX.test(text) ? { email: text.toLowerCase() } : null;
  }

  // Accepts 03001234567, 3001234567, +923001234567, 923001234567.
  const digits = text.replace(/\D/g, "").replace(/^(92|0)/, "");

  return /^3\d{9}$/.test(digits) ? { phone: `+92${digits}` } : null;
};
