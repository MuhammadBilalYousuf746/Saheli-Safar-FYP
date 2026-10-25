
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

const email = `otp.test.${crypto
  .randomInt(0, 1_000_000_000)
  .toString()
  .padStart(9, "0")}@test.local`;

const deliveredOtps = [];

const runTests = async () => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Cannot run tests in production.");
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing.");
  }

  if ((process.env.OTP_HMAC_SECRET || "").length < 32) {
    throw new Error("OTP_HMAC_SECRET is missing.");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "saheli_safar_otp_test",
      serverSelectionTimeoutMS: 10000,
    });

    await OTP.init();

    console.log("\n🧪 CONCURRENT OTP GENERATION TEST\n");

    // Send 10 simultaneous OTP requests.
    const requests = Array.from({ length: 10 }, () =>
      sendEmailOtp({
        email,
        purpose,
        sendEmail: async ({ otp }) => {
          deliveredOtps.push(otp);
        },
      })
    );

    const results = await Promise.allSettled(requests);

    const successful = results.filter(
      (result) => result.status === "fulfilled"
    );

    const rejected = results.filter(
      (result) => result.status === "rejected"
    );

    assert.equal(successful.length, 1);
    assert.equal(rejected.length, 9);

    console.log("✅ Only 1 of 10 OTP requests accepted");

    assert.ok(
      rejected.every((result) =>
        result.reason?.message?.includes(
          "Please wait before requesting another OTP."
        )
      )
    );

    console.log("✅ Other 9 requests blocked by cooldown");

    const records = await OTP.find({ email, purpose });

    assert.equal(records.length, 1);

    console.log("✅ Only one OTP document exists");

    assert.equal(deliveredOtps.length, 1);

    console.log("✅ Email callback triggered only once");

    const verified = await verifyEmailOtp({
      email,
      purpose,
      otp: deliveredOtps[0],
    });

    assert.ok(verified);

    console.log("✅ Winning OTP verified successfully");

    console.log("\n🎉 Concurrent OTP test passed!");
  } finally {
    if (mongoose.connection.readyState === 1) {
      await OTP.deleteMany({ email, purpose });
    }

    await mongoose.disconnect();
  }
};

runTests().catch((error) => {
  console.error("\n❌ Test failed:", error.message);
  process.exitCode = 1;
});
