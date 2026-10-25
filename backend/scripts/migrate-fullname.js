
// One-time migration: copy fullName from the old profile documents
// (passenger / driver / admin profiles) onto the shared User account.
// Safe to run more than once. Profile documents are not changed.
//
// Usage: npm run migrate:fullname

import "dotenv/config";

import mongoose from "mongoose";

import { connectDB } from "../src/config/db.js";

const PROFILE_COLLECTIONS = [
  "passengerprofiles",
  "driverprofiles",
  "adminprofiles",
];

const run = async () => {
  await connectDB();

  const users = mongoose.connection.collection("users");
  let updated = 0;

  for (const name of PROFILE_COLLECTIONS) {
    const profiles = mongoose.connection
      .collection(name)
      .find({ fullName: { $type: "string" } })
      .project({ user: 1, fullName: 1 });

    for await (const profile of profiles) {
      const result = await users.updateOne(
        {
          _id: profile.user,
          $or: [{ fullName: { $exists: false } }, { fullName: null }],
        },
        { $set: { fullName: profile.fullName } }
      );

      updated += result.modifiedCount;
    }
  }

  console.log(`✅ Copied fullName to ${updated} user account(s).`);
};

run()
  .catch((error) => {
    console.error("❌", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
