
import {
  registerSchema,
  resendEmailOtpSchema,
  verifyEmailOtpSchema,
  loginSchema,
} from "./auth.validation.js";

import {
  startRegistration,
  resendRegistrationOtp,
  verifyRegistration,
  loginAppUser,
} from "./auth.service.js";

const isDevelopmentEmail = () =>
  process.env.NODE_ENV === "development" &&
  process.env.EMAIL_PROVIDER === "console";

// Returns the configured email sender, or sends a 503 response.
const getEmailSender = (req, res) => {
  const sendEmail = req.app.locals.sendVerificationEmail;

  if (typeof sendEmail !== "function") {
    res.status(503).json({
      success: false,
      message: "Email verification is temporarily unavailable.",
    });
    return null;
  }

  return sendEmail;
};

const sendOtpResponse = (res, result) => {
  const simulated = isDevelopmentEmail();

  return res.status(200).json({
    success: true,
    message: simulated
      ? "Verification code generated for development testing. No email was sent."
      : result.message,
    expiresInSeconds: result.expiresInSeconds,
    ...(simulated && {
      deliveryMode: "simulated",
    }),
  });
};

// Email OTP authentication controllers shared by passenger and driver.
// Usage: const auth = createAuthController("passenger");
export const createAuthController = (role) => ({
  // POST /api/{role}/auth/register  { fullName, email, phone }
  register: async (req, res, next) => {
    try {
      const { fullName, email, phone } = registerSchema.parse(req.body);

      const sendEmail = getEmailSender(req, res);
      if (!sendEmail) return;

      const result = await startRegistration({
        fullName,
        email,
        phone,
        role,
        sendEmail,
      });

      return sendOtpResponse(res, result);
    } catch (error) {
      next(error);
    }
  },

  // POST /api/{role}/auth/resend-otp  { email }
  resendOtp: async (req, res, next) => {
    try {
      const { email } = resendEmailOtpSchema.parse(req.body);

      const sendEmail = getEmailSender(req, res);
      if (!sendEmail) return;

      const result = await resendRegistrationOtp({
        email,
        role,
        sendEmail,
      });

      return sendOtpResponse(res, result);
    } catch (error) {
      next(error);
    }
  },

  // POST /api/{role}/auth/verify-otp  { email, otp }
  verifyOtp: async (req, res, next) => {
    try {
      const { email, otp } = verifyEmailOtpSchema.parse(req.body);

      const result = await verifyRegistration({ email, otp, role });

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/{role}/auth/login  { email | phone, password }
  login: async (req, res, next) => {
    try {
      const { email, phone, password } = loginSchema.parse(req.body);

      const result = await loginAppUser({
        email,
        phone,
        password,
        role,
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },
});
