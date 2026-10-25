
import { z } from "zod";

// Pakistani phone number validation and normalization.
export const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^(?:\+92|0)3[0-9]{9}$/,
    "Enter a valid Pakistani mobile number."
  )
  .transform((phone) =>
    phone.startsWith("0")
      ? `+92${phone.slice(1)}`
      : phone
  );

// Full name of the account holder.
export const fullNameSchema = z
  .string()
  .trim()
  .min(2, "Full name must be at least 2 characters.")
  .max(80, "Full name must not exceed 80 characters.");

// Email address, normalized to lowercase.
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address.")
  .max(254, "Email address is too long.");

// Secure password requirements for new passwords.
// bcrypt only uses the first 72 bytes.
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .refine(
    (password) => Buffer.byteLength(password, "utf8") <= 72,
    "Password must not exceed 72 bytes."
  )
  .regex(
    /[A-Z]/,
    "Password must contain an uppercase letter."
  )
  .regex(
    /[a-z]/,
    "Password must contain a lowercase letter."
  )
  .regex(
    /[0-9]/,
    "Password must contain a number."
  );

// New password with confirmation, shared by profile completion forms.
export const passwordFields = {
  password: passwordSchema,
  confirmPassword: z
    .string()
    .min(1, "Please confirm your password."),
};

export const passwordsMatch = [
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  },
];

// STEP 1: Registration (passenger or driver).
// Name, email and phone are all required.
// The OTP is sent to the email address.
export const registerSchema = z
  .object({
    fullName: fullNameSchema,
    email: emailSchema,
    phone: phoneSchema,
  })
  .strict();

// STEP 2: Verify email OTP.
export const verifyEmailOtpSchema = z
  .object({
    email: emailSchema,
    otp: z
      .string()
      .regex(/^[0-9]{6}$/, "Enter a valid 6-digit OTP."),
  })
  .strict();

// Resend email OTP.
export const resendEmailOtpSchema = z
  .object({
    email: emailSchema,
  })
  .strict();

// Passenger or driver login with email OR phone.
export const loginSchema = z
  .object({
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
    password: z.string().min(1, "Password is required."),
  })
  .strict()
  .refine((data) => Boolean(data.email) !== Boolean(data.phone), {
    message: "Enter either your email address or your phone number.",
    path: ["email"],
  });

// Admin login.
export const emailLoginSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1, "Password is required."),
  })
  .strict();

export const passwordResetRequestSchema = z
  .object({
    email: emailSchema,
  })
  .strict();

export const passwordResetSchema = z
  .object({
    token: z.string().regex(/^[A-Za-z0-9_-]{43}$/, "Invalid or expired reset link."),
    ...passwordFields,
  })
  .strict()
  .refine(...passwordsMatch);

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .strict()
  .refine(...passwordsMatch);
