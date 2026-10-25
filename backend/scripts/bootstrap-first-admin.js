import "dotenv/config";

import { createInterface } from "node:readline/promises";
import mongoose from "mongoose";
import { z } from "zod";

import { connectDB } from "../src/config/db.js";
import { provisionFirstAdmin } from "../src/modules/admin/admin.service.js";
import {
  emailSchema,
  fullNameSchema,
  passwordSchema,
} from "../src/modules/auth/auth.validation.js";
import { readSecret } from "./read-secret.js";

const bootstrapSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
});

const run = async () => {
  const terminal = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const fullName = await terminal.question("First admin name: ");
    const email = await terminal.question("First admin email: ");
    terminal.close();

    const password = await readSecret("Password: ");
    const confirmation = await readSecret("Confirm password: ");

    if (password !== confirmation) {
      throw new Error("Passwords do not match.");
    }

    const account = bootstrapSchema.parse({ fullName, email, password });
    await connectDB();
    const admin = await provisionFirstAdmin(account);

    console.log(`Initial Full Access admin provisioned: ${admin.email}`);
  } finally {
    terminal.close();
    await mongoose.disconnect();
  }
};

run().catch((error) => {
  if (error instanceof z.ZodError) {
    for (const issue of error.issues) {
      console.error(`${issue.path.join(".")}: ${issue.message}`);
    }
  } else {
    console.error(error.message);
  }
  process.exitCode = 1;
});
