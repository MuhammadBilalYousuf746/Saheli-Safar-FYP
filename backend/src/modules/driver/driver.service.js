
import User from "../auth/user.model.js";
import DriverProfile from "./driver.model.js";
import { createError } from "../../utils/app-error.js";
import { completeDriverProfileSchema } from "./driver.validation.js";

import { completeOnboarding, toAuthUser } from "../auth/auth.service.js";

// Driver profile fields that are safe to return to clients.
export const toDriverProfile = (profile) => ({
  cnic: profile.cnic,
  licenseNumber: profile.licenseNumber,
  vehicle: profile.vehicle,
  verificationStatus: profile.verificationStatus,
  rejectionReason: profile.rejectionReason,
  verifiedAt: profile.verifiedAt,
});

// STEP 3: Complete driver profile after email OTP verification.
// The driver account becomes active, but the driver must be
// approved by an admin (verificationStatus) before offering rides.
export const completeDriverProfile = async ({
  userId,
  ...input
}) => {
  // Validate and normalize profile information.
  const data = completeDriverProfileSchema.parse(input);

  const result = await completeOnboarding({
    userId,
    role: "driver",
    password: data.password,
    duplicateMessages: {
      cnic: "This CNIC is already registered.",
      licenseNumber: "This driving license is already registered.",
      "vehicle.plateNumber": "This vehicle is already registered.",
    },
    createProfile: async (user, session) => {
      const [profile] = await DriverProfile.create(
        [
          {
            user: user._id,
            cnic: data.cnic,
            licenseNumber: data.licenseNumber,
            vehicle: data.vehicle,
          },
        ],
        { session }
      );

      return profile;
    },
  });

  return {
    message:
      "Driver profile submitted successfully. Your account is awaiting admin verification.",
    accessToken: result.accessToken,
    expiresInSeconds: result.expiresInSeconds,
    user: {
      ...toAuthUser(result.user),
      ...toDriverProfile(result.profile),
    },
  };
};

// GET current driver account and profile.
export const getDriverProfile = async (userId) => {
  const [user, profile] = await Promise.all([
    User.findById(userId),
    DriverProfile.findOne({ user: userId }),
  ]);

  if (!user || !profile) {
    throw createError("Driver profile not found.", 404);
  }

  return {
    ...toAuthUser(user),
    ...toDriverProfile(profile),
    createdAt: user.createdAt,
  };
};
