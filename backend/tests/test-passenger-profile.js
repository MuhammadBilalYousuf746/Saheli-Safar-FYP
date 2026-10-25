
import "dotenv/config";

import assert from "node:assert/strict";
import crypto from "node:crypto";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../src/modules/auth/user.model.js";
import PassengerProfile from "../src/modules/passenger/passenger.model.js";

import { completePassengerProfile } from "../src/modules/passenger/passenger.service.js";
import { verifyAccessToken } from "../src/modules/auth/token.service.js";

const createdUserIds = [];

const random = () =>
  crypto.randomInt(0, 1_000_000_000).toString().padStart(9, "0");

// A pending passenger who has already verified their email OTP.
const createTestUser = async (isEmailVerified = true) => {
  const id = random();

  const user = await User.create({
    fullName: "Test Passenger",
    email: `profile.${id}@test.local`,
    phone: `+923${id}`,
    role: "passenger",
    status: "pending",
    isEmailVerified,
  });

  createdUserIds.push(user._id);
  return user;
};

const runTests = async () => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Tests cannot run in production.");
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing.");
  }

  if (
    Buffer.byteLength(process.env.JWT_ACCESS_SECRET || "") < 32
  ) {
    throw new Error("JWT_ACCESS_SECRET is missing.");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "saheli_safar_registration_test",
      serverSelectionTimeoutMS: 10000,
    });

    // Ensure collections and unique indexes exist.
    await Promise.all([
      User.init(),
      PassengerProfile.init(),
    ]);

    console.log("\n🧪 PASSENGER PROFILE TESTS\n");

    const user = await createTestUser();

    const password = "SaheliSecure123!";

    // TEST 1: Password confirmation validation.
    await assert.rejects(
      completePassengerProfile({
        userId: user._id.toString(),
        password,
        confirmPassword: "DifferentPassword123!",
      }),
      (error) => error.name === "ZodError"
    );

    console.log("✅ Invalid profile data rejected");

    // TEST 2: Unverified passenger cannot complete profile.
    const unverifiedUser = await createTestUser(false);

    await assert.rejects(
      completePassengerProfile({
        userId: unverifiedUser._id.toString(),
        password,
        confirmPassword: password,
      }),
      (error) => error.statusCode === 403
    );

    console.log("✅ Unverified passenger blocked");

    // TEST 3: Complete valid passenger profile.
    const result = await completePassengerProfile({
      userId: user._id.toString(),
      password,
      confirmPassword: password,
    });

    assert.equal(result.user.status, "active");
    assert.equal(result.user.role, "passenger");
    assert.equal(result.user.fullName, "Test Passenger");
    assert.equal(result.user.email, user.email);
    assert.equal(result.user.phone, user.phone);

    const savedProfile = await PassengerProfile.findOne({
      user: user._id,
    });

    assert.ok(savedProfile);

    console.log("✅ Profile completed and account activated");

    // TEST 4: Password must be stored as bcrypt hash.
    const savedUser = await User.findById(
      user._id
    ).select("+passwordHash");

    assert.equal(savedUser.status, "active");
    assert.notEqual(savedUser.passwordHash, password);

    assert.equal(
      await bcrypt.compare(password, savedUser.passwordHash),
      true
    );

    console.log("✅ Password securely hashed");

    // TEST 5: Access JWT must belong to active passenger.
    assert.equal(typeof result.accessToken, "string");
    assert.equal(result.expiresInSeconds, 900);

    const tokenPayload = verifyAccessToken(
      result.accessToken
    );

    assert.equal(tokenPayload.userId, user._id.toString());
    assert.equal(tokenPayload.role, "passenger");

    console.log("✅ Access JWT generated and verified");

    // TEST 6: Prevent completing an active profile again.
    await assert.rejects(
      completePassengerProfile({
        userId: user._id.toString(),
        password,
        confirmPassword: password,
      }),
      (error) => error.statusCode === 403
    );

    console.log("✅ Duplicate profile completion blocked");

    // TEST 7: Existing passenger profile must be rejected.
    const secondUser = await createTestUser();

    await PassengerProfile.create({ user: secondUser._id });

    await assert.rejects(
      completePassengerProfile({
        userId: secondUser._id.toString(),
        password,
        confirmPassword: password,
      }),
      (error) => error.statusCode === 409
    );

    // Remove the pre-created profile to check the rollback below.
    await PassengerProfile.deleteOne({ user: secondUser._id });

    console.log("✅ Duplicate profile rejected");

    // TEST 8: Transaction must roll back on failure.
    const secondUserAfter = await User.findById(
      secondUser._id
    ).select("+passwordHash");

    const secondProfile = await PassengerProfile.findOne({
      user: secondUser._id,
    });

    assert.equal(secondUserAfter.status, "pending");
    assert.equal(secondUserAfter.passwordHash, undefined);
    assert.equal(secondProfile, null);

    console.log("✅ Failed transaction rolled back");

    console.log("\n🎉 All passenger profile tests passed!");
  } finally {
    if (mongoose.connection.readyState === 1) {
      await PassengerProfile.deleteMany({
        user: { $in: createdUserIds },
      });

      await User.deleteMany({
        _id: { $in: createdUserIds },
      });
    }

    await mongoose.disconnect();
  }
};

runTests().catch((error) => {
  console.error("\n❌ Test failed:", error.message);
  process.exitCode = 1;
});
