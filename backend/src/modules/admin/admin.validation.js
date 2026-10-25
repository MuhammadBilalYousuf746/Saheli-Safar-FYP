
import { z } from "zod";

import {
  DRIVER_VERIFICATION_STATUSES,
  APP_ROLES,
  USER_STATUSES,
} from "../../utils/constants.js";
import {
  emailSchema,
  fullNameSchema,
  passwordFields,
  passwordsMatch,
} from "../auth/auth.validation.js";

export const objectIdSchema = z
  .string()
  .regex(/^[a-f0-9]{24}$/i, "Invalid resource identifier.");

export const userIdParamsSchema = z.object({
  userId: objectIdSchema,
});

const paginationFields = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
};

// GET /api/admin/drivers
export const listDriversQuerySchema = z
  .object({
    verificationStatus: z
      .enum(DRIVER_VERIFICATION_STATUSES)
      .optional(),
    ...paginationFields,
  })
  .strict();

// PATCH /api/admin/drivers/:userId/verification
export const driverVerificationSchema = z
  .object({
    status: z.enum(["approved", "rejected"]),
    reason: z.string().trim().max(300).optional(),
  })
  .strict()
  .refine(
    (data) => data.status !== "rejected" || Boolean(data.reason),
    {
      message: "A reason is required when rejecting a driver.",
      path: ["reason"],
    }
  );

// GET /api/admin/admins
export const listAdminsQuerySchema = z
  .object({
    ...paginationFields,
  })
  .strict();

// POST /api/admin/admins
export const createAdminSchema = z
  .object({
    fullName: fullNameSchema,
    email: emailSchema,
    ...passwordFields,
    accessLevel: z.enum(["full", "standard"]).default("standard"),
  })
  .strict()
  .refine(...passwordsMatch);

// PATCH /api/admin/admins/:userId/access
export const updateAdminAccessSchema = z
  .object({
    accessLevel: z.enum(["full", "standard"]),
  })
  .strict();

export const updateAdminEmailSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1, "Current password is required."),
  })
  .strict();

export const deactivateAdminSchema = z
  .object({
    password: z.string().min(1, "Current password is required."),
    confirmation: z.literal("DELETE"),
  })
  .strict();

export const verifyAdminEmailChangeSchema = z
  .object({
    token: z.string().regex(/^[A-Za-z0-9_-]{43}$/, "Invalid or expired verification link."),
  })
  .strict();

export const resendAdminEmailVerificationSchema = z.object({}).strict();

// GET /api/admin/users
export const listUsersQuerySchema = z
  .object({
    role: z.enum(APP_ROLES).optional(),
    status: z.enum(USER_STATUSES).optional(),
    ...paginationFields,
  })
  .strict();

// PATCH /api/admin/users/:userId/status
export const updateUserStatusSchema = z
  .object({
    status: z.enum(["active", "suspended", "disabled"]),
  })
  .strict();
