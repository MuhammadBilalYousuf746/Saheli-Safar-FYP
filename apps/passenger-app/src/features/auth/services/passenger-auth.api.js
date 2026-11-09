
import { apiRequest } from "../../../config/api";

export const requestPassengerReset = email => apiRequest("/passenger/auth/forgot-password", {
  method: "POST", body: { email },
});
export const verifyPassengerReset = (email, otp) => apiRequest("/passenger/auth/verify-reset-otp", {
  method: "POST", body: { email, otp },
});
export const resetPassengerPassword = (token, password, confirmPassword) => apiRequest("/passenger/auth/reset-password", {
  method: "POST", body: { token, password, confirmPassword },
});

// ==========================================
// SAHELI SAFAR - PASSENGER AUTHENTICATION API
// ==========================================

// STEP 1: Register passenger with name, email and phone.
// Backend emails a 6-digit OTP to the email address.
export const registerPassenger = async ({
  fullName,
  email,
  phone,
}) => {
  return apiRequest("/passenger/auth/register", {
    method: "POST",
    body: {
      fullName,
      email,
      phone,
    },
  });
};

// STEP 2: Resend email verification OTP.
export const resendPassengerOTP = async (email) => {
  return apiRequest("/passenger/auth/resend-otp", {
    method: "POST",
    body: {
      email,
    },
  });
};

// STEP 3: Verify email OTP.
// Returns an onboarding JWT for completing registration.
export const verifyPassengerOTP = async (email, otp) => {
  return apiRequest("/passenger/auth/verify-otp", {
    method: "POST",
    body: {
      email,
      otp,
    },
  });
};

// STEP 4: Complete passenger profile by creating a password.
// Onboarding JWT is required.
export const completePassengerProfile = async ({
  password,
  confirmPassword,
  onboardingToken,
}) => {
  return apiRequest("/passenger/profile/complete", {
    method: "POST",
    token: onboardingToken,
    body: {
      password,
      confirmPassword,
    },
  });
};

// STEP 5: Login passenger with email OR phone.
// Returns an Access JWT upon successful authentication.
export const loginPassenger = async ({ email, phone, password }) => {
  return apiRequest("/passenger/auth/login", {
    method: "POST",
    body: {
      ...(email ? { email } : { phone }),
      password,
    },
  });
};
