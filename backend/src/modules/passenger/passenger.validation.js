
import { z } from "zod";

import {
  passwordFields,
  passwordsMatch,
  fullNameSchema,
  phoneSchema,
} from "../auth/auth.validation.js";

// Complete Profile request validation.
// Name, email and phone were collected at registration.
export const completePassengerProfileSchema = z
  .object({
    ...passwordFields,
  })
  .strict()
  .refine(...passwordsMatch);

export const emergencyContactSchema = z.object({
  name: fullNameSchema,
  phone: phoneSchema,
  relationship: z.string().trim().min(2, "Relationship must be at least 2 characters.").max(40, "Relationship must not exceed 40 characters."),
}).strict();

// Save one field group per request: each write is atomic in its owning document.
// Baselines provide compare-and-set conflict detection, never identity selection.
export const updatePassengerProfileSchema = z.object({
  fullName: fullNameSchema.optional(),
  expectedFullName: z.string().max(80).nullable().optional(),
  emergencyContact: emergencyContactSchema.nullable().optional(),
  expectedEmergencyContact: emergencyContactSchema.nullable().optional(),
}).strict().superRefine((data, ctx) => {
  const name = data.fullName !== undefined;
  const contact = data.emergencyContact !== undefined;
  if (name === contact) ctx.addIssue({ code: "custom", path: [], message: "Save either the name or emergency contact in one request." });
  if (name && (data.expectedFullName === undefined || data.expectedEmergencyContact !== undefined)) {
    ctx.addIssue({ code: "custom", path: ["expectedFullName"], message: "Reload the saved name before updating it." });
  }
  if (contact && (data.expectedEmergencyContact === undefined || data.expectedFullName !== undefined)) {
    ctx.addIssue({ code: "custom", path: ["expectedEmergencyContact"], message: "Reload the saved contact before updating it." });
  }
});
