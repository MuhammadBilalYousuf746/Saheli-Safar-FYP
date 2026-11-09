// Card summaries never expose a complete contact value, including short input.
export function passengerInitials(value) {
  if (typeof value !== "string") return "";
  const words = value.trim().split(/\s+/u).filter(word => /\p{L}/u.test(word));
  const initial = word => Array.from(word).find(character => /\p{L}/u.test(character)) || "";
  return words.length ? (initial(words[0]) + (words.length > 1 ? initial(words[words.length - 1]) : "")).toLocaleUpperCase() : "";
}

export function maskPhone(value) {
  const digits = typeof value === "string" ? value.replace(/\D/g, "") : "";
  if (!digits) return "Phone unavailable";
  if (digits.length < 7) return "••••";
  const prefix = digits.startsWith("92") && digits.length >= 12 ? "+92 " : "";
  return `${prefix}••• ••• ${digits.slice(-4)}`;
}
export function maskEmail(value) {
  if (typeof value !== "string") return "Email unavailable";
  const parts = value.trim().split("@");
  if (parts.length !== 2 || !parts[0] || !/^[^\s@]+\.[^\s@]+$/.test(parts[1])) return "Email unavailable";
  const local = Array.from(parts[0]);
  return `${local.length > 1 ? local[0] : ""}••••@${parts[1]}`;
}
