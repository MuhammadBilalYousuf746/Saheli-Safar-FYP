import "dotenv/config";

import assert from "node:assert/strict";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import User from "../src/modules/auth/user.model.js";
import { createOnboardingToken } from "../src/modules/auth/token.service.js";
import { requireOnboarding } from "../src/modules/auth/auth.middleware.js";

const phone = `+923${crypto
  .randomInt(0, 1_000_000_000)
  .toString()
  .padStart(9, "0")}`;

let testUserId = null;

// Simulate an Express request without starting the API server.
const testMiddleware = async (authorization) => {
  const req = {
    get: (header) =>
      header.toLowerCase() === "authorization"
        ? authorization
        : undefined,
  };

  const res = {
    statusCode: 200,
    body: null,

    status(code) {
      this.statusCode = code;
      return this;
    },

    json(data) {
      this.body = data;
      return this;
    },
  };

  let nextCalled = false;
  let nextError = null;

  await requireOnboarding("passenger")(req, res, (error) => {
    if (error) {
      nextError = error;
    } else {
      nextCalled = true;
    }
  });

  if (nextError) {
    throw nextError;
  }

  return { req, res, nextCalled };
};

const runTests = async () => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Tests cannot run in production.");
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing.");
  }

  if (
    Buffer.byteLength(
      process.env.JWT_ONBOARDING_SECRET || ""
    ) < 32
  ) {
    throw new Error("JWT_ONBOARDING_SECRET is missing.");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "saheli_safar_registration_test",
      serverSelectionTimeoutMS: 10000,
    });

    await User.init();

    console.log("\n🧪 ONBOARDING MIDDLEWARE TESTS\n");

    const user = await User.create({
      fullName: "Middleware Passenger",
      email: `middleware.${phone.slice(4)}@test.local`,
      phone,
      role: "passenger",
      status: "pending",
      isEmailVerified: true,
    });

    testUserId = user._id;

    const token = createOnboardingToken(user);

    // TEST 1: Missing token.
    const missing = await testMiddleware(undefined);

    assert.equal(missing.res.statusCode, 401);
    assert.equal(missing.nextCalled, false);

    console.log("✅ Missing token rejected");

    // TEST 2: Invalid token.
    const invalid = await testMiddleware(
      "Bearer invalid.jwt.token"
    );

    assert.equal(invalid.res.statusCode, 401);

    console.log("✅ Invalid token rejected");

    // TEST 3: Expired token.
    const expiredToken = jwt.sign(
      { tokenType: "onboarding" },
      process.env.JWT_ONBOARDING_SECRET,
      {
        algorithm: "HS256",
        subject: user._id.toString(),
        issuer: "saheli-safar-api",
        audience: "saheli-safar-onboarding",
        expiresIn: -1,
      }
    );

    const expired = await testMiddleware(
      `Bearer ${expiredToken}`
    );

    assert.equal(expired.res.statusCode, 401);

    console.log("✅ Expired token rejected");

    // TEST 4: Valid verified pending passenger.
    const valid = await testMiddleware(
      `Bearer ${token}`
    );

    assert.equal(valid.nextCalled, true);
    assert.equal(
      valid.req.onboardingUser.id,
      user._id.toString()
    );
    assert.equal(valid.req.onboardingUser.role, "passenger");
    assert.equal(valid.req.onboardingUser.phone, phone);

    console.log("✅ Verified pending passenger allowed");

    // TEST 5: Active account must be blocked.
    await User.updateOne(
      { _id: user._id },
      { $set: { status: "active" } }
    );

    const active = await testMiddleware(
      `Bearer ${token}`
    );

    assert.equal(active.res.statusCode, 403);

    console.log("✅ Active account blocked");

    // TEST 6: Suspended account must be blocked.
    await User.updateOne(
      { _id: user._id },
      { $set: { status: "suspended" } }
    );

    const suspended = await testMiddleware(
      `Bearer ${token}`
    );

    assert.equal(suspended.res.statusCode, 403);

    console.log("✅ Suspended account blocked");

    // TEST 7: Unverified passenger must be blocked.
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          status: "pending",
          isEmailVerified: false,
        },
      }
    );

    const unverified = await testMiddleware(
      `Bearer ${token}`
    );

    assert.equal(unverified.res.statusCode, 403);

    console.log("✅ Unverified passenger blocked");

    // TEST 8: Deleted account must be blocked.
    await User.deleteOne({ _id: user._id });

    const deleted = await testMiddleware(
      `Bearer ${token}`
    );

    assert.equal(deleted.res.statusCode, 401);

    console.log("✅ Deleted account blocked");

    console.log(
      "\n🎉 All onboarding middleware tests passed!"
    );
  } finally {
    if (
      mongoose.connection.readyState === 1 &&
      testUserId
    ) {
      await User.deleteOne({ _id: testUserId });
    }

    await mongoose.disconnect();
  }
};

runTests().catch((error) => {
  console.error("\n❌ Test failed:", error.message);
  process.exitCode = 1;
});
