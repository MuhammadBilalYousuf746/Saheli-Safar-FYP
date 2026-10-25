
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
} from "./driver.controller.js";

const router = Router();

// ==========================================
// DRIVER AUTHENTICATION ROUTES
// ==========================================

// /auth/register, /auth/resend-otp, /auth/verify-otp, /auth/login
router.use("/auth", createAuthRoutes("driver"));

// ==========================================
// DRIVER PROFILE ROUTES
// ==========================================

// Submit profile, CNIC, license and vehicle (onboarding token).
// The driver then waits for admin verification.
router.post(
  "/profile/complete",
  createProfileLimiter(),
  requireOnboarding("driver"),
  completeProfileController
);

// Current driver profile, including verificationStatus (access token).
router.get(
  "/profile/me",
  requireAuth("driver"),
  getMyProfileController
);

export default router;
