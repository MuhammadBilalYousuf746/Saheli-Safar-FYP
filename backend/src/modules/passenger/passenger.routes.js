
import { Router } from "express";
import { createPassengerRecoveryRoutes } from "../auth/passenger-recovery.routes.js";
import { createPassengerVerificationRoutes } from "../verification/verification.routes.js";

import { createAuthRoutes } from "../auth/auth.routes.js";
import {
  requireOnboarding,
  requireAuth,
} from "../auth/auth.middleware.js";
import { createProfileLimiter } from "../../middlewares/rateLimiters.js";

import {
  completeProfileController,
  getMyProfileController,
  updateMyProfileController,
} from "./passenger.controller.js";

const router = Router();

// ==========================================
// PASSENGER AUTHENTICATION ROUTES
// ==========================================

// /auth/register, /auth/resend-otp, /auth/verify-otp, /auth/login
router.use("/auth", createAuthRoutes("passenger"));
router.use("/auth", createPassengerRecoveryRoutes());
router.use("/verification", createPassengerVerificationRoutes());

// ==========================================
// PASSENGER PROFILE ROUTES
// ==========================================

// Complete profile after OTP verification (onboarding token).
router.post(
  "/profile/complete",
  createProfileLimiter(),
  requireOnboarding("passenger"),
  completeProfileController
);

// Current passenger profile (access token).
router.get(
  "/profile/me",
  requireAuth("passenger"),
  getMyProfileController
);

router.patch("/profile/me", requireAuth("passenger"), createProfileLimiter(), updateMyProfileController);

export default router;
