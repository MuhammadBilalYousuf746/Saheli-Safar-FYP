
import { z } from "zod";

import {
  passwordFields,
  passwordsMatch,
} from "../auth/auth.validation.js";

// Complete Profile request validation.
// Name, email and phone were collected at registration.
export const completePassengerProfileSchema = z
  .object({
    ...passwordFields,
  })
  .strict()
  .refine(...passwordsMatch);
