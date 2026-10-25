
import { Router } from "express";

import { createAuthRoutes } from "../auth/auth.routes.js";
import {
  requireOnboarding,
  requireAuth,
} from "../auth/auth.middleware.js";
import { createProfileLimiter } from "../../middlewares/rateLimiters.js";

import {
  completeProfileController,
  getMyProfileController,
} from "./passenger.controller.js";

const router = Router();

// ==========================================
// PASSENGER AUTHENTICATION ROUTES
// ==========================================

// /auth/register, /auth/resend-otp, /auth/verify-otp, /auth/login
router.use("/auth", createAuthRoutes("passenger"));

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

export default router;
