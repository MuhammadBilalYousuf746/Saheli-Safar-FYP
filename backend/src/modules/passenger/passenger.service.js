
import User from "../auth/user.model.js";
import PassengerProfile from "./passenger.model.js";
import { createError } from "../../utils/app-error.js";
import { completePassengerProfileSchema } from "./passenger.validation.js";

import { completeOnboarding, toAuthUser } from "../auth/auth.service.js";

// STEP 3: Set password and activate the passenger account
// after email OTP verification.
export const completePassengerProfile = async ({
  userId,
  ...input
}) => {
  // Validate profile information.
  const data = completePassengerProfileSchema.parse(input);

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

  return {
    ...toAuthUser(user),
    createdAt: user.createdAt,
  };
};
