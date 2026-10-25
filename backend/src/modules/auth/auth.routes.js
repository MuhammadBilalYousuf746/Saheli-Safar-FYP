
import { Router } from "express";

import { createAuthController } from "./auth.controller.js";
import {
  createOtpRequestLimiter,
  createOtpVerifyLimiter,
  createLoginLimiter,
} from "../../middlewares/rateLimiters.js";

// Email OTP authentication routes for one role.
// Mounted by each app module:
//   /api/passenger/auth/*  -> createAuthRoutes("passenger")
//   /api/driver/auth/*     -> createAuthRoutes("driver")
export const createAuthRoutes = (role) => {
  const router = Router();

  const auth = createAuthController(role);

  const otpRequestLimiter = createOtpRequestLimiter();
  const otpVerifyLimiter = createOtpVerifyLimiter();
  const loginLimiter = createLoginLimiter();

  // STEP 1: Start registration (name, email, phone) and email OTP.
  router.post("/register", otpRequestLimiter, auth.register);

  // STEP 2: Resend registration OTP.
  router.post("/resend-otp", otpRequestLimiter, auth.resendOtp);

  // STEP 3: Verify email OTP and receive onboarding token.
  router.post("/verify-otp", otpVerifyLimiter, auth.verifyOtp);

  // Login with email or phone, and password.
  router.post("/login", loginLimiter, auth.login);

  return router;
};
