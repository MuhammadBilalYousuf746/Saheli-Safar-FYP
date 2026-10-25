
import { Router } from "express";

import {
  requireAuth,
  requireAdminPermission,
  requireAdminManagerOrSelf,
} from "../auth/auth.middleware.js";
import {
  createLoginLimiter,
  createPasswordChangeLimiter,
  createPasswordResetRequestLimiter,
  createPasswordResetSubmitLimiter,
  createAdminSensitiveActionLimiter,
} from "../../middlewares/rateLimiters.js";
import {
  changePasswordController,
  requestPasswordResetController,
  resetPasswordController,
} from "../auth/password-reset.controller.js";

import {
  loginController,
  getMyProfileController,
  listAdminsController,
  createAdminController,
  updateAdminAccessController,
  updateAdminEmailController,
  deactivateAdminController,
  verifyAdminEmailChangeController,
  updateOwnAdminEmailController,
  resendOwnAdminEmailVerificationController,
  listDriversController,
  getDriverController,
  updateDriverVerificationController,
  listUsersController,
  updateUserStatusController,
} from "./admin.controller.js";

const router = Router();

// ==========================================
// ADMIN AUTHENTICATION ROUTES
// ==========================================

router.post("/auth/login", createLoginLimiter(), loginController);
router.post(
  "/auth/forgot-password",
  createPasswordResetRequestLimiter(),
  requestPasswordResetController
);
router.post(
  "/auth/reset-password",
  createPasswordResetSubmitLimiter(),
  resetPasswordController
);
router.post(
  "/auth/verify-email-change",
  createPasswordResetSubmitLimiter(),
  verifyAdminEmailChangeController
);

// Every route below requires an active admin access token.
router.use(requireAuth("admin"));

router.post(
  "/auth/change-password",
  createPasswordChangeLimiter(),
  changePasswordController
);

router.patch(
  "/profile/email",
  createPasswordChangeLimiter(),
  updateOwnAdminEmailController
);
router.post(
  "/profile/email/resend",
  createPasswordResetSubmitLimiter(),
  resendOwnAdminEmailVerificationController
);
router.delete(
  "/profile/me",
  createAdminSensitiveActionLimiter(),
  deactivateAdminController
);

router.get("/profile/me", getMyProfileController);

router.get("/admins", requireAdminPermission("manageAdmins"), listAdminsController);
router.post("/admins", requireAdminPermission("manageAdmins"), createAdminController);
router.patch(
  "/admins/:userId/access",
  requireAdminPermission("manageAdmins"),
  updateAdminAccessController
);
router.patch(
  "/admins/:userId/email",
  requireAdminManagerOrSelf(),
  createAdminSensitiveActionLimiter(),
  updateAdminEmailController
);
router.delete(
  "/admins/:userId",
  requireAdminManagerOrSelf(),
  createAdminSensitiveActionLimiter(),
  deactivateAdminController
);

// ==========================================
// DRIVER VERIFICATION ROUTES
// ==========================================

router.get("/drivers", listDriversController);

router.get("/drivers/:userId", getDriverController);

router.patch(
  "/drivers/:userId/verification",
  updateDriverVerificationController
);

// ==========================================
// USER MANAGEMENT ROUTES
// ==========================================

router.get("/users", listUsersController);

router.patch("/users/:userId/status", updateUserStatusController);

export default router;
