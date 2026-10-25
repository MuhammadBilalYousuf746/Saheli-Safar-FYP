import { apiRequest } from "../../../config/api";

// ==========================================
// SAHELI SAFAR - DRIVER AUTHENTICATION API
// Mirrors backend/src/modules/driver/driver.routes.js
// ==========================================

// STEP 1: Register driver with name, email and phone.
// Backend emails a 6-digit OTP to the email address.
export const registerDriver = async ({ fullName, email, phone }) => {
  return apiRequest("/driver/auth/register", {
    method: "POST",
    body: { fullName, email, phone },
  });
};

// STEP 2: Resend email verification OTP.
export const resendDriverOTP = async (email) => {
  return apiRequest("/driver/auth/resend-otp", {
    method: "POST",
    body: { email },
  });
};

// STEP 3: Verify email OTP.
// Returns an onboarding JWT (valid 30 minutes) for completing registration.
export const verifyDriverOTP = async (email, otp) => {
  return apiRequest("/driver/auth/verify-otp", {
    method: "POST",
    body: { email, otp },
  });
};

// STEP 4: Submit documents, vehicle and password.
// Returns an access JWT. The driver then waits for admin verification.
export const completeDriverProfile = async ({
  onboardingToken,
  password,
  confirmPassword,
  cnic,
  licenseNumber,
  vehicle,
}) => {
  return apiRequest("/driver/profile/complete", {
    method: "POST",
    token: onboardingToken,
    body: {
      password,
      confirmPassword,
      cnic,
      licenseNumber,
      vehicle,
    },
  });
};

// Login with email OR phone.
export const loginDriver = async ({ email, phone, password }) => {
  return apiRequest("/driver/auth/login", {
    method: "POST",
    body: {
      ...(email ? { email } : { phone }),
      password,
    },
  });
};

// Current driver account, documents, vehicle and verification status.
export const getDriverProfile = async (accessToken) => {
  return apiRequest("/driver/profile/me", {
    token: accessToken,
  });
};
