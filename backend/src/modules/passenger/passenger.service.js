
import User from "../auth/user.model.js";
import PassengerProfile from "./passenger.model.js";
import { createError } from "../../utils/app-error.js";
import { completePassengerProfileSchema, updatePassengerProfileSchema } from "./passenger.validation.js";

import { completeOnboarding, toAuthUser } from "../auth/auth.service.js";

// STEP 3: Set password and activate the passenger account
// after email OTP verification.
export const completePassengerProfile = async ({
  userId,
  ...input
}) => {
  // Validate profile information.
  const data = completePassengerProfileSchema.parse(input);

  // Initialization builds declared indexes on a fresh connection. A collection
  // dropped afterwards does not invalidate Mongoose's cached init promise.
  // Verify the owner constraint before the account/profile transaction; leave
  // any database repair to an explicitly approved administrative operation.
  try {
    await PassengerProfile.init();
    const indexes = await PassengerProfile.listIndexes();
    const hasUniqueOwner = indexes.some((index) =>
      index.unique === true &&
      index.key?.user === 1 &&
      Object.keys(index.key).length === 1 &&
      !index.partialFilterExpression &&
      !index.sparse
    );
    if (!hasUniqueOwner) throw new Error("Passenger owner index is missing.");
  } catch {
    throw createError("Passenger registration is temporarily unavailable. Please try again later.", 503);
  }

  const result = await completeOnboarding({
    userId,
    role: "passenger",
    password: data.password,
    createProfile: async (user, session) => {
      const [profile] = await PassengerProfile.create(
        [{ user: user._id }],
        { session }
      );

      return profile;
    },
  });

  return {
    message: "Passenger profile completed successfully.",
    accessToken: result.accessToken,
    expiresInSeconds: result.expiresInSeconds,
    user: toAuthUser(result.user),
  };
};

// GET current passenger account and profile.
export const getPassengerProfile = async (userId) => {
  const [user, profile] = await Promise.all([
    User.findById(userId),
    PassengerProfile.findOne({ user: userId }),
  ]);

  if (!user || !profile) {
    throw createError("Passenger profile not found.", 404);
  }

  return passengerProfileDto(user, profile);
};

export const passengerProfileDto = (user, profile) => ({
  ...toAuthUser(user),
  createdAt: user.createdAt,
  emergencyContact: profile.emergencyContact ? {
    name: profile.emergencyContact.name,
    phone: profile.emergencyContact.phone,
    relationship: profile.emergencyContact.relationship,
  } : null,
});

export const updatePassengerProfile = async (userId, input) => {
  const data = updatePassengerProfileSchema.parse(input);
  const [user, profile] = await Promise.all([
    User.findOne({ _id: userId, role: "passenger", status: "active" }),
    PassengerProfile.findOne({ user: userId }),
  ]);
  if (!user || !profile) throw createError("Passenger profile not found.", 404);
  const conflict = () => createError("These details changed since you opened the form. Cancel and refresh the profile before trying again.", 409);
  if (data.fullName !== undefined) {
    const baseline = data.expectedFullName === null
      ? { $or: [{ fullName: null }, { fullName: "" }] } : { fullName: data.expectedFullName };
    const updated = await User.findOneAndUpdate({ _id: userId, role: "passenger", status: "active", ...baseline },
      { $set: { fullName: data.fullName } }, { returnDocument: "after", runValidators: true });
    if (!updated) throw conflict();
    return passengerProfileDto(updated, profile);
  }
  const previous = data.expectedEmergencyContact;
  const baseline = previous === null ? { emergencyContact: null } : {
    "emergencyContact.name": previous.name,
    "emergencyContact.phone": previous.phone,
    "emergencyContact.relationship": previous.relationship,
  };
  const updated = await PassengerProfile.findOneAndUpdate({ _id: profile._id, user: userId, ...baseline },
    { $set: { emergencyContact: data.emergencyContact } }, { returnDocument: "after", runValidators: true });
  if (!updated) throw conflict();
  return passengerProfileDto(user, updated);
};
