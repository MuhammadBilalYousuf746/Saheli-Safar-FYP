
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

// Random test email; no actual email is sent.
const email = `otp.test.${crypto
  .randomInt(0, 1_000_000_000)
  .toString()
  .padStart(9, "0")}@test.local`;

let receivedOtp;

const runTest = async () => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("OTP tests cannot run in production.");
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing.");
  }

  if ((process.env.OTP_HMAC_SECRET || "").length < 32) {
    throw new Error("OTP_HMAC_SECRET is missing or too short.");
  }

  try {
    // Isolated test database, not the main app database.
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "saheli_safar_otp_test",
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✅ Test database connected");

    // Simulate email delivery without sending a real email.
    const result = await sendEmailOtp({
      email,
      purpose,
      sendEmail: async ({ otp }) => {
        receivedOtp = otp;
      },
    });

    assert.equal(result.expiresInSeconds, 300);
    assert.match(receivedOtp, /^[0-9]{6}$/);
    console.log("✅ OTP generated successfully");

    const record = await OTP.findOne({
      email,
      purpose,
    }).select("+otpHash");

    assert.ok(record);
    assert.notEqual(record.otpHash, receivedOtp);
    console.log("✅ OTP stored as hash");

    const wrongOtp =
      receivedOtp === "000000" ? "000001" : "000000";

    const invalid = await verifyEmailOtp({
      email,
      purpose,
      otp: wrongOtp,
    });

    assert.equal(invalid, null);
    console.log("✅ Incorrect OTP rejected");

    const valid = await verifyEmailOtp({
      email,
      purpose,
      otp: receivedOtp,
    });

    assert.ok(valid);
    console.log("✅ Correct OTP verified");

    const reused = await verifyEmailOtp({
      email,
      purpose,
      otp: receivedOtp,
    });

    assert.equal(reused, null);
    console.log("✅ OTP reuse blocked");

    console.log("\n🎉 All OTP smoke tests passed!");
  } finally {
    if (mongoose.connection.readyState === 1) {
      await OTP.deleteMany({ email, purpose });
    }

    await mongoose.disconnect();
  }
};

runTest().catch((error) => {
  console.error("❌ OTP test failed:", error.message);
  process.exitCode = 1;
});
