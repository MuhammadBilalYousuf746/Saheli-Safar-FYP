import { apiRequest } from "../../../config/api";

// Whitelist display fields and bind the response to the session that requested it.
// Identity is supplied by the auth provider, never by route/query parameters.
export function parsePassengerProfile(response, expectedId) {
  const user = response?.user;
  if (response?.success !== true || !expectedId || user?.id !== expectedId ||
      user.role !== "passenger" || user.status !== "active") {
    throw new Error("The profile response could not be verified. Please retry.");
  }
  const text = value => typeof value === "string" && value.trim() ? value.trim() : null;
  const createdAt = typeof user.createdAt === "string" && Number.isFinite(Date.parse(user.createdAt)) ? user.createdAt : null;
  const contact = user.emergencyContact;
  if (contact != null && (Array.isArray(contact) || typeof contact.name !== "string" ||
      typeof contact.phone !== "string" || typeof contact.relationship !== "string")) {
    throw new Error("The emergency contact response could not be verified. Please refresh.");
  }
  return {
    fullName: text(user.fullName), email: text(user.email), phone: text(user.phone),
    role: user.role, status: user.status,
    isEmailVerified: typeof user.isEmailVerified === "boolean" ? user.isEmailVerified : null,
    createdAt,
    emergencyContact: contact ? { name: text(contact.name), phone: text(contact.phone), relationship: text(contact.relationship) } : null,
  };
}

export async function updateCurrentPassengerProfile(owner, changes) {
  if (!owner?.user?.id || typeof owner.accessToken !== "string") {
    throw new Error("Your session changed. Reopen your profile before saving.");
  }
  const response = await apiRequest("/passenger/profile/me", { method: "PATCH", authenticated: true, expectedSession: owner, body: changes });
  return parsePassengerProfile(response, owner.user.id);
}

export function validateProfileDraft(mode, draft) {
  const errors = {};
  const name = mode === "name" ? draft.fullName : draft.name;
  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80) {
    errors[mode === "name" ? "fullName" : "name"] = "Enter a name between 2 and 80 characters.";
  }
  if (mode === "contact") {
    if (!/^(?:\+92|0)3[0-9]{9}$/.test((draft.phone || "").trim())) errors.phone = "Enter a Pakistani mobile number, such as 03001234567.";
    if (!draft.relationship?.trim() || draft.relationship.trim().length < 2 || draft.relationship.trim().length > 40) errors.relationship = "Enter a relationship between 2 and 40 characters.";
  }
  return errors;
}

export async function getCurrentPassengerProfile(expectedId) {
  const response = await apiRequest("/passenger/profile/me", { authenticated: true });
  return parsePassengerProfile(response, expectedId);
}

export function profileErrorMessage(error) {
  if (error.status === 403) return "You do not have permission to view this profile.";
  if (error.status === 404) return "Your Passenger profile could not be found. Please contact support.";
  if (error.status >= 500) return "The profile service is temporarily unavailable. Please retry.";
  if (error.status === 401) return "Your session has expired. Please sign in again.";
  if (error.status === 409) return "These details changed elsewhere. Cancel and refresh before saving again.";
  return error.message || "Unable to load your profile. Check your connection and retry.";
}
