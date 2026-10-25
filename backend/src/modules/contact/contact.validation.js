
import { z } from "zod";

import { CONTACT_TOPICS } from "../../utils/constants.js";
import {
  emailSchema,
  fullNameSchema,
  phoneSchema,
} from "../auth/auth.validation.js";

// POST /api/contact
export const contactMessageSchema = z
  .object({
    fullName: fullNameSchema,
    email: emailSchema,

    // Optional. Empty string is treated as missing.
    phone: phoneSchema
      .optional()
      .or(z.literal(""))
      .transform((phone) => phone || undefined),

    topic: z.enum(CONTACT_TOPICS, {
      message: "Please choose a topic.",
    }),

    message: z
      .string()
      .trim()
      .min(10, "Message must be at least 10 characters.")
      .max(2000, "Message must not exceed 2000 characters."),

    // Honeypot: hidden on the website, bots fill it in.
    website: z.string().max(200).optional(),
  })
  .strict();
