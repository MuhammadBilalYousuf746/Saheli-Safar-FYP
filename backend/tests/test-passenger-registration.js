
import "dotenv/config";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import mongoose from "mongoose";

import User from "../src/modules/auth/user.model.js";
import OTP from "../src/modules/auth/otp.model.js";

import {
  startRegistration,
  verifyRegistration,
} from "../src/modules/auth/auth.service.js";
import { registerSchema } from "../src/modules/auth/auth.validation.js";

const random = () =>
  crypto.randomInt(0, 1_000_000_000).toString().padStart(9, "0");

// Generate random test details.
const createTestPhone = () => `+923${random()}`;
const createTestEmail = () => `reg.${random()}@test.local`;

const fullName = "Test Passenger";
const email = createTestEmail();
const phone = createTestPhone();
const existingEmail = createTestEmail();
const existingPhone = createTestPhone();

let receivedOtp = null;
let receivedTo = null;

const runTests = async () => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Tests cannot run in production.");
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing.");
  }

  if ((process.env.OTP_HMAC_SECRET || "").length < 32) {
    throw new Error("OTP_HMAC_SECRET is missing.");
  }

  try {
    // Use an isolated database.
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "saheli_safar_registration_test",
      serverSelectionTimeoutMS: 10000,
    });

    await Promise.all([User.init(), OTP.init()]);

    console.log("\n🧪 PASSENGER REGISTRATION TESTS\n");

    // TEST 1: Name, email and phone are all required.
    for (const missing of ["fullName", "email", "phone"]) {
      const body = {
        fullName,
        email,
        phone: "03001234567",
      };
      delete body[missing];

      assert.equal(registerSchema.safeParse(body).success, false);
    }

    console.log("✅ Name, email and phone are required");

    // TEST 2: Start registration. OTP goes to the email.
    const startResult = await startRegistration({
      role: "passenger",
      fullName,
      email,
      phone,
      sendEmail: async ({ to, otp }) => {
        // Mock delivery. No actual email is sent.
        receivedTo = to;
        receivedOtp = otp;
      },
    });

    assert.equal(startResult.expiresInSeconds, 300);
    assert.equal(receivedTo, email);
    assert.match(receivedOtp, /^[0-9]{6}$/);

    console.log("✅ Registration OTP sent to email");

    // TEST 3: Account must not exist before verification.
    assert.equal(await User.findOne({ email }), null);

    console.log("✅ Account not created before OTP verification");

    // TEST 4: Reject incorrect OTP.
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

    console.log("✅ Incorrect OTP rejected");

    // TEST 5: Verify correct OTP and create account.
    const result = await verifyRegistration({
      role: "passenger",
      email,
      otp: receivedOtp,
    });

    assert.equal(result.user.role, "passenger");
    assert.equal(result.user.status, "pending");
    assert.equal(result.user.isEmailVerified, true);

    console.log("✅ Passenger account created");

    // TEST 6: Name, email and phone saved in MongoDB.
    const savedUser = await User.findOne({ email });

    assert.ok(savedUser);
    assert.equal(savedUser.fullName, fullName);
    assert.equal(savedUser.phone, phone);
    assert.equal(savedUser.role, "passenger");
    assert.equal(savedUser.status, "pending");
    assert.equal(savedUser.isEmailVerified, true);

    console.log("✅ Name, email and phone saved in MongoDB");

    // TEST 7: Reject OTP reuse.
    await assert.rejects(
      verifyRegistration({
        role: "passenger",
        email,
        otp: receivedOtp,
      }),
      /Invalid or expired verification code/
    );

    console.log("✅ OTP reuse blocked");

    // TEST 8: Block already registered email.
    await User.create({
      fullName: "Existing Passenger",
      email: existingEmail,
      phone: existingPhone,
      role: "passenger",
      status: "active",
      isEmailVerified: true,
    });

    await assert.rejects(
      startRegistration({
        role: "passenger",
        fullName,
        email: existingEmail,
        phone: createTestPhone(),
        sendEmail: async () => {},
      }),
      (error) => error.statusCode === 409
    );

    console.log("✅ Existing email protected");

    // TEST 9: Block already registered phone.
    await assert.rejects(
      startRegistration({
        role: "passenger",
        fullName,
        email: createTestEmail(),
        phone: existingPhone,
        sendEmail: async () => {},
      }),
      /This phone number is already registered/
    );

    console.log("✅ Existing phone protected");

    console.log("\n🎉 All passenger registration tests passed!");
  } finally {
    if (mongoose.connection.readyState === 1) {
      await OTP.deleteMany({
        email: { $in: [email, existingEmail] },
      });

      await User.deleteMany({
        email: { $in: [email, existingEmail] },
      });
    }

    await mongoose.disconnect();
  }
};

runTests().catch((error) => {
  console.error("\n❌ Test failed:", error.message);
  process.exitCode = 1;
});
