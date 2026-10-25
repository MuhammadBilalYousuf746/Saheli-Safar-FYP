
import {
  completePassengerProfile,
  getPassengerProfile,
} from "./passenger.service.js";

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
