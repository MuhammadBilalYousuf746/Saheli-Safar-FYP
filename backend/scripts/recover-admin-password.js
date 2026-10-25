import "dotenv/config";

import { parseArgs } from "node:util";
import mongoose from "mongoose";
import { z } from "zod";

import { connectDB } from "../src/config/db.js";
import { hashPassword } from "../src/modules/auth/auth.service.js";
import User from "../src/modules/auth/user.model.js";
import PasswordResetToken from "../src/modules/auth/password-reset-token.model.js";
import { emailSchema, passwordSchema } from "../src/modules/auth/auth.validation.js";
import { readSecret } from "./read-secret.js";

const run = async () => {
  const { values } = parseArgs({
    options: {
      email: { type: "string" },
    },
  });
  const email = emailSchema.parse(values.email).toLowerCase();
  const password = passwordSchema.parse(
    await readSecret("New password: ")
  );
  const confirmation = await readSecret("Confirm new password: ");

  if (password !== confirmation) {
    throw new Error("Passwords do not match.");
  }

  await connectDB();
  const user = await User.findOne({
    email,
    role: "admin",
    status: "active",
  }).select("_id");

  if (!user) {
    throw new Error("No active admin account matches that email.");
  }

  const passwordHash = await hashPassword(password);
  await mongoose.connection.transaction(async (session) => {
    const update = await User.updateOne(
      {
        _id: user._id,
        role: "admin",
        status: "active",
      },
      {
        $set: { passwordHash },
        $inc: { authVersion: 1 },
      },
      { runValidators: true, session }
    );

    if (update.matchedCount !== 1) {
      throw new Error(
        "The admin account changed during recovery; no password was updated."
      );
    }

    await PasswordResetToken.deleteMany({ user: user._id }, { session });
  });
  console.log(
    "Admin password recovered. Existing sessions were revoked; permissions and account status were unchanged."
  );
};

run()
  .catch((error) => {
    if (error instanceof z.ZodError) {
      for (const issue of error.issues) {
        console.error(`${issue.path.join(".")}: ${issue.message}`);
      }
    } else {
      console.error(error.message);
    }
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
