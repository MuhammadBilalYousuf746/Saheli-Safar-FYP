
import { emailLoginSchema } from "../auth/auth.validation.js";
import {
  userIdParamsSchema,
  listDriversQuerySchema,
  driverVerificationSchema,
  listAdminsQuerySchema,
  createAdminSchema,
  updateAdminAccessSchema,
  updateAdminEmailSchema,
  deactivateAdminSchema,
  verifyAdminEmailChangeSchema,
  resendAdminEmailVerificationSchema,
  listUsersQuerySchema,
  updateUserStatusSchema,
} from "./admin.validation.js";

import {
  loginAdmin,
  getAdminProfile,
  listAdmins,
  createAdminAccount,
  updateAdminAccess,
  requestAdminEmailChange,
  verifyAdminEmailChange,
  resendOwnAdminEmailVerification,
  deactivateAdminAccount,
  getAdminOverview,
  listDrivers,
  getDriver,
  updateDriverVerification,
  listUsers,
  updateUserStatus,
} from "./admin.service.js";

// POST /api/admin/auth/login
export const loginController = async (req, res, next) => {
  try {
    const { email, password } = emailLoginSchema.parse(req.body);

    const result = await loginAdmin({ email, password });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/profile/me
export const getMyProfileController = async (req, res, next) => {
  try {
    const user = await getAdminProfile(req.user.id);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/admins?page=1&limit=20
export const listAdminsController = async (req, res, next) => {
  try {
    const query = listAdminsQuerySchema.parse(req.query);
    const result = await listAdmins(query);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/admins
export const createAdminController = async (req, res, next) => {
  try {
    const payload = createAdminSchema.parse(req.body);
    const admin = await createAdminAccount({
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password,
      accessLevel: payload.accessLevel,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Admin account created successfully.",
      admin,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/admins/:userId/access
export const updateAdminAccessController = async (req, res, next) => {
  try {
    const { userId } = userIdParamsSchema.parse(req.params);
    const { accessLevel } = updateAdminAccessSchema.parse(req.body);
    const admin = await updateAdminAccess({
      userId,
      accessLevel,
      changedBy: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Admin access level updated successfully.",
      admin,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/admins/:userId/email
export const updateAdminEmailController = async (req, res, next) => {
  try {
    const { userId } = userIdParamsSchema.parse(req.params);
    const payload = updateAdminEmailSchema.parse(req.body);
    const result = await requestAdminEmailChange({
      userId,
      email: payload.email,
      password: payload.password,
      changedBy: req.user.id,
      sendEmail: req.app.locals.sendAdminEmailChange,
      notifyPreviousEmail: req.app.locals.notifyAdminEmailChange,
    });

    return res.status(202).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/profile/email
export const updateOwnAdminEmailController = async (req, res, next) => {
  try {
    const payload = updateAdminEmailSchema.parse(req.body);
    const result = await requestAdminEmailChange({
      userId: req.user.id,
      email: payload.email,
      password: payload.password,
      changedBy: req.user.id,
      sendEmail: req.app.locals.sendAdminEmailChange,
      notifyPreviousEmail: req.app.locals.notifyAdminEmailChange,
    });

    return res.status(202).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/profile/email/resend
export const resendOwnAdminEmailVerificationController = async (
  req,
  res,
  next
) => {
  try {
    resendAdminEmailVerificationSchema.parse(req.body);
    const result = await resendOwnAdminEmailVerification({
      userId: req.user.id,
      sendEmail: req.app.locals.sendAdminEmailChange,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/overview
export const getAdminOverviewController = async (req, res, next) => {
  try {
    const overview = await getAdminOverview();

    return res.status(200).json({
      success: true,
      ...overview,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/auth/verify-email-change
export const verifyAdminEmailChangeController = async (req, res, next) => {
  res.set("Cache-Control", "no-store");

  try {
    const { token } = verifyAdminEmailChangeSchema.parse(req.body);
    const result = await verifyAdminEmailChange({ token });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/admins/:userId
export const deactivateAdminController = async (req, res, next) => {
  try {
    const userId = req.params.userId
      ? userIdParamsSchema.parse(req.params).userId
      : req.user.id;
    const payload = deactivateAdminSchema.parse(req.body);
    const result = await deactivateAdminAccount({
      userId,
      password: payload.password,
      confirmation: payload.confirmation,
      changedBy: req.user.id,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/drivers?verificationStatus=pending&page=1&limit=20
export const listDriversController = async (req, res, next) => {
  try {
    const query = listDriversQuerySchema.parse(req.query);

    const result = await listDrivers(query);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/drivers/:userId
export const getDriverController = async (req, res, next) => {
  try {
    const { userId } = userIdParamsSchema.parse(req.params);

    const driver = await getDriver(userId);

    return res.status(200).json({
      success: true,
      driver,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/drivers/:userId/verification
export const updateDriverVerificationController = async (
  req,
  res,
  next
) => {
  try {
    const { userId } = userIdParamsSchema.parse(req.params);
    const { status, reason } = driverVerificationSchema.parse(
      req.body
    );

    const driver = await updateDriverVerification({
      userId,
      status,
      reason,
      adminId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: `Driver ${status} successfully.`,
      driver,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/users?role=passenger&status=active&page=1&limit=20
export const listUsersController = async (req, res, next) => {
  try {
    const query = listUsersQuerySchema.parse(req.query);

    const result = await listUsers(query);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/users/:userId/status
export const updateUserStatusController = async (req, res, next) => {
  try {
    const { userId } = userIdParamsSchema.parse(req.params);
    const { status } = updateUserStatusSchema.parse(req.body);

    const user = await updateUserStatus({ userId, status });

    return res.status(200).json({
      success: true,
      message: "User status updated successfully.",
      user,
    });
  } catch (error) {
    next(error);
  }
};
