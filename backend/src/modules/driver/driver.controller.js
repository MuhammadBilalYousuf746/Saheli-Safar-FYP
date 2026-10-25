
import {
  completeDriverProfile,
  getDriverProfile,
} from "./driver.service.js";

// POST /api/driver/profile/complete
export const completeProfileController = async (req, res, next) => {
  try {
    // User identity comes from verified onboarding middleware.
    // Never accept userId from the request body.
    const result = await completeDriverProfile({
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

// GET /api/driver/profile/me
export const getMyProfileController = async (req, res, next) => {
  try {
    const user = await getDriverProfile(req.user.id);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
