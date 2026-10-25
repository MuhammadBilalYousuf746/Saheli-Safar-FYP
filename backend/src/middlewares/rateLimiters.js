
import { rateLimit } from "express-rate-limit";

const WINDOW_MS = 15 * 60 * 1000;

// Each call creates a limiter with its own counter,
// so passenger, driver and admin routes are limited separately.
const createLimiter = (limit, message) =>
  rateLimit({
    windowMs: WINDOW_MS,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    ...(message && {
      message: {
        success: false,
        message,
      },
    }),
  });

// Global API limiter.
export const createApiLimiter = () =>
  createLimiter(
    200,
    "Too many requests. Please try again later."
  );

// OTP registration and resend requests.
export const createOtpRequestLimiter = () =>
  createLimiter(
    20,
    "Too many OTP requests. Please try again later."
  );

// OTP verification.
export const createOtpVerifyLimiter = () =>
  createLimiter(
    30,
    "Too many verification requests. Please try again later."
  );

// Login attempts.
export const createLoginLimiter = () =>
  createLimiter(
    10,
    "Too many login attempts. Please try again later."
  );

export const createPasswordResetRequestLimiter = () =>
  createLimiter(
    10,
    "Too many password reset requests. Please try again later."
  );

export const createPasswordResetSubmitLimiter = () =>
  createLimiter(
    10,
    "Too many password reset attempts. Please try again later."
  );

export const createPasswordChangeLimiter = () =>
  createLimiter(
    5,
    "Too many password change attempts. Please try again later."
  );

export const createAdminSensitiveActionLimiter = () =>
  createLimiter(
    15,
    "Sensitive admin actions are temporarily rate-limited. Please wait before trying again."
  );

// Profile completion.
export const createProfileLimiter = () =>
  createLimiter(
    20,
    "Too many requests. Please try again later."
  );

// Website contact form.
export const createContactLimiter = () =>
  createLimiter(
    5,
    "Too many messages. Please try again in a few minutes."
  );
