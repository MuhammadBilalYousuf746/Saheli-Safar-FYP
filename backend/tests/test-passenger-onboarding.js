
import "dotenv/config";

import assert from "node:assert/strict";
import crypto from "node:crypto";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import User from "../src/modules/auth/user.model.js";
import OTP from "../src/modules/auth/otp.model.js";

import {
  startRegistration,
  verifyRegistration,
} from "../src/modules/auth/auth.service.js";

import {
  verifyOnboardingToken,
  verifyAccessToken,
} from "../src/modules/auth/token.service.js";

const random = () =>
  crypto.randomInt(0, 1_000_000_000).toString().padStart(9, "0");

const email = `onboard.${random()}@test.local`;
const phone = `+923${random()}`;

let receivedOtp;

const runTests = async () => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Tests cannot run in production.");
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing.");
  }

  for (const key of [
    "OTP_HMAC_SECRET",
    "JWT_ONBOARDING_SECRET",
    "JWT_ACCESS_SECRET",
  ]) {
    if (Buffer.byteLength(process.env[key] || "") < 32) {
      throw new Error(`${key} is missing or too short.`);
    }
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "saheli_safar_registration_test",
      serverSelectionTimeoutMS: 10000,
    });

    await Promise.all([User.init(), OTP.init()]);

    console.log("\n🧪 PASSENGER ONBOARDING TESTS\n");

    // TEST 1: Start registration using mock email.
    await startRegistration({
      role: "passenger",
      fullName: "Onboarding Passenger",
      email,
      phone,
      sendEmail: async ({ otp }) => {
        receivedOtp = otp;
      },
    });

    assert.match(receivedOtp, /^[0-9]{6}$/);

    console.log("✅ Registration OTP generated");

    // TEST 2: Invalid OTP cannot generate a token.
    const wrongOtp =
      receivedOtp === "000000" ? "000001" : "000000";

    await assert.rejects(
      verifyRegistration({
        role: "passenger",
        email,
        otp: wrongOtp,
      }),
      /Invalid or expired verification code/
    );

    assert.equal(await User.findOne({ email }), null);

    console.log("✅ Invalid OTP cannot create account");

    // TEST 3: Verify OTP and receive onboarding token.
    const result = await verifyRegistration({
      role: "passenger",
      email,
      otp: receivedOtp,
    });

    assert.equal(typeof result.onboardingToken, "string");
    assert.equal(result.expiresInSeconds, 1800);

    console.log("✅ Onboarding JWT generated after verification");

    // TEST 4: Verify onboarding token.
    const payload = verifyOnboardingToken(
      result.onboardingToken
    );

    assert.equal(payload.userId, result.user.id);
    assert.equal(payload.tokenType, "onboarding");

    console.log("✅ Onboarding JWT verified successfully");

    // TEST 5: Check token expiration and purpose.
    const decoded = jwt.decode(result.onboardingToken);

    assert.equal(decoded.tokenType, "onboarding");
    assert.equal(decoded.aud, "saheli-safar-onboarding");
    assert.equal(decoded.exp - decoded.iat, 1800);

    console.log("✅ Token purpose and 30-minute expiry valid");

    // TEST 6: Onboarding token cannot act as access token.
    assert.throws(() =>
      verifyAccessToken(result.onboardingToken)
    );

    console.log("✅ Onboarding JWT rejected as access token");

    // TEST 7: Verify passenger account in MongoDB.
    const user = await User.findOne({ email });

    assert.ok(user);
    assert.equal(user.role, "passenger");
    assert.equal(user.status, "pending");
    assert.equal(user.isEmailVerified, true);
    assert.equal(user.phone, phone);

    console.log("✅ Verified passenger remains pending");

    // TEST 8: OTP cannot be reused.
    await assert.rejects(
      verifyRegistration({
        role: "passenger",
        email,
        otp: receivedOtp,
      }),
      /Invalid or expired verification code/
    );

    console.log("✅ OTP reuse blocked");

    console.log("\n🎉 All onboarding integration tests passed!");
  } finally {
    if (mongoose.connection.readyState === 1) {
      await OTP.deleteMany({ email });
      await User.deleteMany({ email });
    }

    await mongoose.disconnect();
  }
};

runTests().catch((error) => {
  console.error("\n❌ Test failed:", error.message);
  process.exitCode = 1;
});
