import {
  changePasswordSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
} from "./auth.validation.js";
import {
  changeAdminPassword,
  requestAdminPasswordReset,
  resetAdminPassword,
} from "./password-reset.service.js";
import { ZodError } from "zod";

const handlePasswordError = (error, res, next, operation) => {
  if (
    error instanceof ZodError ||
    (Number.isInteger(error.statusCode) && error.statusCode < 500)
  ) {
    return next(error);
  }

  console.error(`${operation} failed.`, {
    code:
      typeof error?.code === "string" &&
      /^[A-Z0-9_]{1,32}$/.test(error.code)
        ? error.code
        : "unknown",
  });

  return res.status(503).json({
    success: false,
    message: "The password service is temporarily unavailable.",
  });
};

export const requestPasswordResetController = async (req, res, next) => {
  res.set("Cache-Control", "no-store");

  try {
    const { email } = passwordResetRequestSchema.parse(req.body);
    const result = await requestAdminPasswordReset({
      email,
      sendEmail: req.app.locals.sendPasswordResetEmail,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return handlePasswordError(
      error,
      res,
      next,
      "Password reset request"
    );
  }
};

export const resetPasswordController = async (req, res, next) => {
  res.set("Cache-Control", "no-store");

  try {
    const { token, password } = passwordResetSchema.parse(req.body);
    const result = await resetAdminPassword({ token, password });

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return handlePasswordError(error, res, next, "Password reset");
  }
};

export const changePasswordController = async (req, res, next) => {
  res.set("Cache-Control", "no-store");

  try {
    const { currentPassword, password } = changePasswordSchema.parse(
      req.body
    );
    const result = await changeAdminPassword({
      userId: req.user.id,
      currentPassword,
      password,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return handlePasswordError(error, res, next, "Password change");
  }
};
