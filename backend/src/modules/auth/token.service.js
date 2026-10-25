
import jwt from "jsonwebtoken";

import { ROLES, APP_ROLES } from "../../utils/constants.js";

const ISSUER = "saheli-safar-api";

const ACCESS_AUDIENCE = "saheli-safar-apps";
const ONBOARDING_AUDIENCE = "saheli-safar-onboarding";

export const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 15 * 60;
export const ONBOARDING_TOKEN_EXPIRES_IN_SECONDS = 30 * 60;

// Read and validate JWT secrets.
const getSecret = (key) => {
  const secret = process.env[key];

  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error(`${key} is not configured correctly.`);
  }

  return secret;
};

// Extract a valid MongoDB user ID.
const getUserId = (user) => {
  const id = user?._id?.toString();

  if (!id || !/^[a-f0-9]{24}$/i.test(id)) {
    throw new Error("Invalid user ID.");
  }

  return id;
};

// Create a token for OTP-verified passengers or drivers
// who still need to complete their profile.
export const createOnboardingToken = (user) => {
  if (
    !APP_ROLES.includes(user?.role) ||
    user?.status !== "pending" ||
    user?.isEmailVerified !== true
  ) {
    throw new Error("User is not eligible for onboarding.");
  }

  return jwt.sign(
    {
      tokenType: "onboarding",
      role: user.role,
    },
    getSecret("JWT_ONBOARDING_SECRET"),
    {
      algorithm: "HS256",
      subject: getUserId(user),
      issuer: ISSUER,
      audience: ONBOARDING_AUDIENCE,
      expiresIn: ONBOARDING_TOKEN_EXPIRES_IN_SECONDS,
    }
  );
};

// Verify a passenger or driver onboarding token.
export const verifyOnboardingToken = (token) => {
  const payload = jwt.verify(
    token,
    getSecret("JWT_ONBOARDING_SECRET"),
    {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: ONBOARDING_AUDIENCE,
    }
  );

  if (
    payload.tokenType !== "onboarding" ||
    !APP_ROLES.includes(payload.role) ||
    !/^[a-f0-9]{24}$/i.test(payload.sub || "")
  ) {
    throw new Error("Invalid onboarding token.");
  }

  return {
    userId: payload.sub,
    role: payload.role,
    tokenType: "onboarding",
  };
};

// Create an access token for an active account.
export const createAccessToken = (user) => {
  if (
    user?.status !== "active" ||
    !ROLES.includes(user?.role)
  ) {
    throw new Error("User is not eligible for access.");
  }

  return jwt.sign(
    {
      tokenType: "access",
      role: user.role,
      authVersion: Number.isInteger(user.authVersion)
        ? user.authVersion
        : 0,
    },
    getSecret("JWT_ACCESS_SECRET"),
    {
      algorithm: "HS256",
      subject: getUserId(user),
      issuer: ISSUER,
      audience: ACCESS_AUDIENCE,
      expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    }
  );
};

// Verify an access token.
export const verifyAccessToken = (token) => {
  const payload = jwt.verify(
    token,
    getSecret("JWT_ACCESS_SECRET"),
    {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: ACCESS_AUDIENCE,
    }
  );

  if (
    payload.tokenType !== "access" ||
    !ROLES.includes(payload.role) ||
    !Number.isInteger(payload.authVersion ?? 0) ||
    (payload.authVersion ?? 0) < 0 ||
    !/^[a-f0-9]{24}$/i.test(payload.sub || "")
  ) {
    throw new Error("Invalid access token.");
  }

  return {
    userId: payload.sub,
    role: payload.role,
    authVersion: payload.authVersion ?? 0,
    tokenType: "access",
  };
};
