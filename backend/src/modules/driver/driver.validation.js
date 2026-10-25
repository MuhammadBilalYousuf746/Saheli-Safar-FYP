
import { z } from "zod";

import { VEHICLE_TYPES } from "../../utils/constants.js";
import {
  passwordFields,
  passwordsMatch,
} from "../auth/auth.validation.js";

// Pakistani CNIC, with or without dashes.
// Normalized to XXXXX-XXXXXXX-X
const cnicSchema = z
  .string()
  .trim()
  .regex(
    /^[0-9]{5}-?[0-9]{7}-?[0-9]$/,
    "Enter a valid 13-digit CNIC number."
  )
  .transform((cnic) => {
    const digits = cnic.replace(/-/g, "");
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
  });

const licenseNumberSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(
    /^[A-Z0-9-]{5,20}$/,
    "Enter a valid driving license number."
  );

const vehicleSchema = z
  .object({
    type: z.enum(VEHICLE_TYPES, {
      message: `Vehicle type must be one of: ${VEHICLE_TYPES.join(", ")}.`,
    }),

    make: z.string().trim().min(2).max(40),

    model: z.string().trim().min(1).max(40),

    color: z.string().trim().min(2).max(30),

    year: z.coerce
      .number()
      .int()
      .min(1980, "Vehicle year is too old.")
      .max(
        new Date().getFullYear() + 1,
        "Vehicle year is invalid."
      ),

    plateNumber: z
      .string()
      .trim()
      .toUpperCase()
      .regex(
        /^[A-Z0-9 -]{2,15}$/,
        "Enter a valid vehicle plate number."
      ),
  })
  .strict();

// Complete Driver Profile request validation.
// Name, email and phone were collected at registration.
export const completeDriverProfileSchema = z
  .object({
    ...passwordFields,
    cnic: cnicSchema,
    licenseNumber: licenseNumberSchema,
    vehicle: vehicleSchema,
  })
  .strict()
  .refine(...passwordsMatch);
