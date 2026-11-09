import { Router } from "express";
import { ZodError } from "zod";
import { createOtpVerifyLimiter, createPasswordResetRequestLimiter, createPasswordResetSubmitLimiter } from "../../middlewares/rateLimiters.js";
import { isApplicationError } from "../../utils/app-error.js";
import { passengerRecovery } from "./passenger-recovery.service.js";

export const createPassengerRecoveryRoutes = (service = passengerRecovery) => {
  const router = Router();
  router.use((req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
  const handle = operation => async (req, res, next) => {
    try {
      const result = await service[operation]({ ...req.body,
        ...(operation === "request" ? { sendEmail: req.app.locals.sendVerificationEmail } : {}) });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      if (error instanceof ZodError || isApplicationError(error)) return next(error);
      // Never forward raw transport/database errors that could contain secrets.
      res.status(503).json({ success: false, message: "Password recovery is temporarily unavailable. Please retry." });
    }
  };
  router.post("/forgot-password", createPasswordResetRequestLimiter(), handle("request"));
  router.post("/verify-reset-otp", createOtpVerifyLimiter(), handle("verify"));
  router.post("/reset-password", createPasswordResetSubmitLimiter(), handle("reset"));
  return router;
};
