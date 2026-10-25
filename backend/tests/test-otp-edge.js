
import "dotenv/config";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import mongoose from "mongoose";

import OTP from "../src/modules/auth/otp.model.js";
import {
  sendEmailOtp,
  verifyEmailOtp,
} from "../src/modules/auth/otp.service.js";

const purpose = "email_verification";
const testEmails = [];

const createTestEmail = () => {
  const email = `otp.test.${crypto
    .randomInt(0, 1_000_000_000)
    .toString()
    .padStart(9, "0")}@test.local`;

  testEmails.push(email);
  return email;
};

const requestOtp = async (email) => {
  let receivedOtp;

  await sendEmailOtp({
    email,
    purpose,
    sendEmail: async ({ otp }) => {
      receivedOtp = otp;
    },
  });

  return receivedOtp;
};

const runTests = async () => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Cannot run tests in production.");
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if ((process.env.OTP_HMAC_SECRET || "").length < 32) {
    throw new Error("OTP_HMAC_SECRET is not configured.");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "saheli_safar_otp_test",
      serverSelectionTimeoutMS: 10000,
    });

    console.log("\n🧪 OTP SECURITY TESTS\n");

    // TEST 1: Resend cooldown
    const cooldownEmail = createTestEmail();

    await requestOtp(cooldownEmail);

    await assert.rejects(
      requestOtp(cooldownEmail),
      /Please wait before requesting another OTP/
    );

    console.log("✅ Resend cooldown enforced");

    // TEST 2: Maximum incorrect attempts
    const attemptsEmail = createTestEmail();
    const correctOtp = await requestOtp(attemptsEmail);

    const wrongOtp =
      correctOtp === "000000" ? "000001" : "000000";

    for (let i = 0; i < 5; i++) {
      const result = await verifyEmailOtp({
        email: attemptsEmail,
        purpose,
        otp: wrongOtp,
      });

      assert.equal(result, null);
    }

    const blocked = await verifyEmailOtp({
      email: attemptsEmail,
      purpose,
      otp: correctOtp,
    });

    assert.equal(blocked, null);

    console.log("✅ Maximum 5 incorrect attempts enforced");

    // TEST 3: Expired OTP rejection
    const expiredEmail = createTestEmail();
    const expiredOtp = await requestOtp(expiredEmail);

    await OTP.updateOne(
      { email: expiredEmail, purpose },
      {
        $set: {
          expiresAt: new Date(Date.now() - 1000),
        },
      }
    );

    const expiredResult = await verifyEmailOtp({
      email: expiredEmail,
      purpose,
      otp: expiredOtp,
    });

    assert.equal(expiredResult, null);

    console.log("✅ Expired OTP rejected");

    // TEST 4: Concurrent OTP verification
    const concurrentEmail = createTestEmail();
    const concurrentOtp = await requestOtp(concurrentEmail);

    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        verifyEmailOtp({
          email: concurrentEmail,
          purpose,
          otp: concurrentOtp,
        })
      )
    );

    assert.equal(
      results.filter((result) => result !== null).length,
      1
    );

    console.log("✅ Concurrent OTP reuse blocked");

    console.log("\n🎉 All OTP security tests passed!");
  } finally {
    if (mongoose.connection.readyState === 1) {
      await OTP.deleteMany({
        email: { $in: testEmails },
      });
    }

    await mongoose.disconnect();
  }
};

runTests().catch((error) => {
  console.error("\n❌ Test failed:", error.message);
  process.exitCode = 1;
});
