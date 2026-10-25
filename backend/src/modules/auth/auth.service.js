
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "./user.model.js";
import { createError } from "../../utils/app-error.js";
import {
  APP_ROLES,
  isValidEmail,
  isValidPhone,
} from "../../utils/constants.js";

import {
  sendEmailOtp,
  verifyEmailOtp,
  findPendingRegistration,
} from "./otp.service.js";
import {
  createAccessToken,
  createOnboardingToken,
  ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  ONBOARDING_TOKEN_EXPIRES_IN_SECONDS,
} from "./token.service.js";

const BCRYPT_ROUNDS = 12;
const OTP_PURPOSE = "email_verification";

// "passenger" -> "Passenger"
const capitalize = (text) =>
  text.charAt(0).toUpperCase() + text.slice(1);

const validateEmail = (email) => {
  if (!isValidEmail(email)) {
    throw createError("Invalid email address.", 400);
  }
};

const validateAppRole = (role) => {
  if (!APP_ROLES.includes(role)) {
    throw new Error(`Self-registration is not supported for role: ${role}`);
  }
};

// Public user fields returned after authentication.
export const toAuthUser = (user) => ({
  id: user._id.toString(),
  fullName: user.fullName || null,
  email: user.email || null,
  phone: user.phone || null,
  role: user.role,
  status: user.status,
  isEmailVerified: user.isEmailVerified,
  permissions: Array.isArray(user.permissions)
    ? user.permissions
    : [],
});

export const hashPassword = (password) =>
  bcrypt.hash(password, BCRYPT_ROUNDS);

// An existing account blocks registration unless it is
// a pending account of the same role (registration can resume).
const canResume = (user, role) =>
  user.role === role && user.status === "pending";

// ==========================================
// EMAIL REGISTRATION (PASSENGER / DRIVER)
// ==========================================

// STEP 1: Save name, email and phone, and email an OTP.
export const startRegistration = async ({
  fullName,
  email,
  phone,
  role,
  sendEmail,
}) => {
  validateAppRole(role);
  validateEmail(email);

  if (!isValidPhone(phone)) {
    throw createError("Invalid phone number.", 400);
  }

  if (typeof fullName !== "string" || fullName.trim().length < 2) {
    throw createError("Full name is required.", 400);
  }

  const [emailOwner, phoneOwner] = await Promise.all([
    User.findOne({ email }).select("role status"),
    User.findOne({ phone }).select("email role status"),
  ]);

  if (emailOwner && !canResume(emailOwner, role)) {
    throw createError(
      "An account already exists with this email address.",
      409
    );
  }

  // The phone may only belong to the same pending registration.
  if (
    phoneOwner &&
    (phoneOwner.email !== email || !canResume(phoneOwner, role))
  ) {
    throw createError(
      "This phone number is already registered.",
      409
    );
  }

  const result = await sendEmailOtp({
    email,
    purpose: OTP_PURPOSE,
    sendEmail,
    name: fullName,
    registration: { fullName: fullName.trim(), phone, role },
  });

  return {
    message: "Verification code sent to your email.",
    expiresInSeconds: result.expiresInSeconds,
  };
};

// Resend the email OTP for a registration that was already started.
export const resendRegistrationOtp = async ({
  email,
  role,
  sendEmail,
}) => {
  validateAppRole(role);
  validateEmail(email);

  const registration = await findPendingRegistration({
    email,
    purpose: OTP_PURPOSE,
  });

  if (!registration || registration.role !== role) {
    throw createError(
      "No pending registration found for this email. Please register again.",
      400
    );
  }

  const result = await sendEmailOtp({
    email,
    purpose: OTP_PURPOSE,
    sendEmail,
  });

  return {
    message: "Verification code sent to your email.",
    expiresInSeconds: result.expiresInSeconds,
  };
};

// STEP 2: Verify email OTP, create pending account, issue onboarding token.
export const verifyRegistration = async ({ email, otp, role }) => {
  validateAppRole(role);
  validateEmail(email);

  if (typeof otp !== "string" || !/^[0-9]{6}$/.test(otp)) {
    throw createError("Invalid verification code.", 400);
  }

  const existingUser = await User.findOne({ email }).select(
    "role status"
  );

  if (existingUser && !canResume(existingUser, role)) {
    throw createError(
      "This email address is already registered.",
      409
    );
  }

  // Do not consume an OTP that belongs to another app's registration.
  const pending = await findPendingRegistration({
    email,
    purpose: OTP_PURPOSE,
  });

  if (pending && pending.role !== role) {
    throw createError("Invalid or expired verification code.", 400);
  }

  const otpRecord = await verifyEmailOtp({
    email,
    purpose: OTP_PURPOSE,
    otp,
  });

  const registration = otpRecord?.registration;

  if (!registration || registration.role !== role) {
    throw createError("Invalid or expired verification code.", 400);
  }

  let user;

  try {
    user = await User.findOneAndUpdate(
      {
        email,
        role,
        status: "pending",
      },
      {
        $set: {
          fullName: registration.fullName,
          phone: registration.phone,
          isEmailVerified: true,
        },
        $setOnInsert: {
          email,
          role,
          status: "pending",
        },
      },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
      }
    );
  } catch (error) {
    if (error.code === 11000) {
      throw createError(
        error.keyPattern?.phone
          ? "This phone number is already registered."
          : "This email address is already registered.",
        409
      );
    }

    throw error;
  }

  // Issue a restricted onboarding token only after
  // successful OTP verification and account creation.
  const onboardingToken = createOnboardingToken(user);

  return {
    message: "Email verified successfully.",
    onboardingToken,
    expiresInSeconds: ONBOARDING_TOKEN_EXPIRES_IN_SECONDS,
    user: toAuthUser(user),
  };
};

// STEP 3: Set password, activate the pending account and
// create its role profile.
// `createProfile(user, session)` creates the role-specific document.
// `duplicateMessages` maps unique index fields to error messages.
export const completeOnboarding = async ({
  userId,
  role,
  password,
  createProfile,
  duplicateMessages = {},
}) => {
  validateAppRole(role);

  // User ID must come from the verified onboarding middleware.
  if (!mongoose.isObjectIdOrHexString(userId)) {
    throw createError("Invalid onboarding session.", 401);
  }

  // Never store a plain-text password.
  const passwordHash = await hashPassword(password);

  const eligibleFilter = {
    _id: userId,
    role,
    status: "pending",
    isEmailVerified: true,
  };

  let completedUser;
  let profile;

  try {
    // Both database updates must succeed together.
    completedUser = await mongoose.connection.transaction(
      async (session) => {
        // Recheck eligibility inside the transaction.
        const user = await User.findOne(eligibleFilter).session(
          session
        );

        if (!user) {
          throw createError(
            `${capitalize(role)} is not eligible to complete registration.`,
            403
          );
        }

        profile = await createProfile(user, session);

        // Activate the shared User account.
        const updatedUser = await User.findOneAndUpdate(
          eligibleFilter,
          {
            $set: {
              passwordHash,
              status: "active",
            },
          },
          {
            session,
            returnDocument: "after",
            runValidators: true,
          }
        );

        if (!updatedUser) {
          throw createError(
            `Unable to complete ${role} registration.`,
            409
          );
        }

        return updatedUser;
      }
    );
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];

      throw createError(
        duplicateMessages[field] ||
          `${capitalize(role)} profile already exists.`,
        409
      );
    }

    throw error;
  }

  // Issue an access token only after transaction commits.
  return {
    user: completedUser,
    profile,
    accessToken: createAccessToken(completedUser),
    expiresInSeconds: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  };
};

// ==========================================
// LOGIN
// ==========================================

// Shared password and account status checks.
const authenticate = async (user, password, invalidMessage) => {
  // Avoid revealing whether an account exists.
  if (!user || !user.passwordHash) {
    throw createError(invalidMessage, 401);
  }

  // Verify password against the stored bcrypt hash.
  const isPasswordValid = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw createError(invalidMessage, 401);
  }

  // Block incomplete accounts.
  if (user.status === "pending") {
    throw createError(
      "Please complete your account registration before logging in.",
      403
    );
  }

  // Block suspended accounts.
  if (user.status === "suspended") {
    throw createError(
      "Your account is suspended. Please contact support.",
      403
    );
  }

  // Only active accounts can log in.
  if (user.status !== "active") {
    throw createError("Your account is not active.", 403);
  }

  await User.updateOne(
    { _id: user._id },
    { $set: { lastLoginAt: new Date() } }
  );

  return {
    message: "Login successful.",
    accessToken: createAccessToken(user),
    tokenType: "Bearer",
    expiresInSeconds: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    user: toAuthUser(user),
  };
};

// Passenger or driver login using email OR phone, and password.
export const loginAppUser = async ({ email, phone, password, role }) => {
  validateAppRole(role);

  const filter = email ? { email, role } : { phone, role };

  // Password hash is excluded by default, so select it explicitly.
  const user = await User.findOne(filter).select("+passwordHash");

  return authenticate(
    user,
    password,
    email
      ? "Invalid email or password."
      : "Invalid phone number or password."
  );
};

// Admin login using email and password.
export const loginWithEmail = async ({ email, password, role }) => {
  const user = await User.findOne({ email, role }).select(
    "+passwordHash"
  );

  return authenticate(
    user,
    password,
    "Invalid email or password."
  );
};
