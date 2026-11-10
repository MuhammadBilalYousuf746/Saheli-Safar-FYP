import { z } from "zod";

const headerText = (max) => z.string().trim().min(1).max(max).refine(
  value => !/[\x00-\x1f\x7f]/.test(value),
  "Invalid control characters.",
);

export const contactMessageSchema = z.object({
  name: headerText(80),
  email: headerText(254).pipe(z.email()),
  phone: headerText(40).refine(value => {
    const digits = value.replace(/\D/g, "");
    return /^\+?[\d\s()-]+$/.test(value) && digits.length >= 10 && digits.length <= 15;
  }, "Please enter a valid phone number (10 to 15 digits)."),
  message: z.string().trim().min(10).max(2000).refine(
    value => !/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value),
    "Invalid control characters.",
  ),
}).strict();
