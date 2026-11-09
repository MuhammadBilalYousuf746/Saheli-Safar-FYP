
import {
  completePassengerProfile,
  getPassengerProfile,
  updatePassengerProfile,
} from "./passenger.service.js";
import { ZodError } from "zod";
import { isApplicationError } from "../../utils/app-error.js";

export const updateMyProfileController = async (req, res, next) => {
  res.set("Cache-Control", "no-store");
  try {
    const user = await updatePassengerProfile(req.user.id, req.body);
    return res.status(200).json({ success: true, user });
  } catch (error) {
    if (error instanceof ZodError || isApplicationError(error)) return next(error);
    return res.status(500).json({ success: false, message: "Unable to save your profile. Please retry." });
  }
};

// POST /api/passenger/profile/complete
export const completeProfileController = async (req, res, next) => {
  try {
    // User identity comes from verified onboarding middleware.
    // Never accept userId from the request body.
    const result = await completePassengerProfile({
      ...(req.body || {}),
      userId: req.onboardingUser?.id,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/passenger/profile/me
export const getMyProfileController = async (req, res, next) => {
  try {
    const user = await getPassengerProfile(req.user.id);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
