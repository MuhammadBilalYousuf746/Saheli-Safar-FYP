// Grant manageAdmins to exactly two explicitly named existing admin users.
// Usage:
//   npm run grant-admin-permission -- --email first@example.com --email second@example.com

import "dotenv/config";

import { parseArgs } from "node:util";
import mongoose from "mongoose";

import { connectDB } from "../src/config/db.js";
import User from "../src/modules/auth/user.model.js";

const run = async () => {
  const { values } = parseArgs({
    options: {
      email: { type: "string", multiple: true },
    },
  });

  const emails = (values.email || [])
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (emails.length !== 2 || new Set(emails).size !== 2) {
    throw new Error(
      "Provide exactly two different existing admin emails using --email twice."
    );
  }

  await connectDB();

  const result = await mongoose.connection.transaction(async (session) => {
    const users = await User.find({
      email: { $in: emails },
      role: "admin",
    })
      .select("_id email role permissions")
      .session(session);

    const matchedEmails = new Set(users.map((user) => user.email));
    const missingEmails = emails.filter((email) => !matchedEmails.has(email));

    if (users.length !== 2 || missingEmails.length > 0) {
      throw new Error(
        `Expected two existing admin accounts; matching admin account(s) not found for: ${missingEmails.join(", ")}. No permissions were changed.`
      );
    }

    const updateResult = await User.updateMany(
      {
        _id: { $in: users.map((user) => user._id) },
        email: { $in: emails },
        role: "admin",
      },
      {
        $addToSet: { permissions: "manageAdmins" },
      },
      { runValidators: true, session }
    );

    if (updateResult.matchedCount !== 2) {
      throw new Error(
        `Expected to update two admin accounts, but matched ${updateResult.matchedCount}. No permissions were changed.`
      );
    }

    return updateResult;
  });

  console.log(
    `✅ manageAdmins granted to the two explicitly selected admins. Newly modified accounts: ${result.modifiedCount}.`
  );
};

run()
  .catch((error) => {
    console.error("❌", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
