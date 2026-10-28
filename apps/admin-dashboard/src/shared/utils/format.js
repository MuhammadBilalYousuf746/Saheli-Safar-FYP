const dateFormatter = new Intl.DateTimeFormat("en-PK", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-PK", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export const formatDate = (value) =>
  value ? dateFormatter.format(new Date(value)) : "—";

export const formatDateTime = (value) =>
  value ? dateTimeFormatter.format(new Date(value)) : "—";

// "+923001234567" -> "0300 1234567"
export const formatPhone = (phone) =>
  phone?.startsWith("+92")
    ? `0${phone.slice(3, 6)} ${phone.slice(6)}`
    : phone || "—";

export const capitalize = (text) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : "";

export const formatVehicle = (vehicle) =>
  vehicle
    ? `${vehicle.make} ${vehicle.model} · ${vehicle.plateNumber}`
    : "—";

export const initials = (name) =>
  (name || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
