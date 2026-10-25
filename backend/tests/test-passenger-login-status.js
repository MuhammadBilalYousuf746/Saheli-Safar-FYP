
import "dotenv/config";

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import assert from "node:assert/strict";

import User from "../src/modules/auth/user.model.js";

const API_URL = "http://localhost:5000/api/passenger/auth/login";

const createdUserIds = [];

const generateTestPhone = () => {
  const digits = crypto.randomInt(100000000, 1000000000);
  return `+923${digits}`;
};

const testLogin = async (phone, password, status) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone,
      password,
    }),
  });

  const result = await response.json();

  console.log(`\n${status.toUpperCase()} ACCOUNT TEST`);
  console.log("HTTP:", response.status);
  console.log("Message:", result.message);
  console.log("Access Token Generated:", Boolean(result.accessToken));

  assert.equal(
    response.status,
    403,
    `${status} account should return HTTP 403.`
  );

  assert.equal(result.success, false);

  assert.equal(
    Boolean(result.accessToken),
    false,
    "Restricted accounts must not receive an access token."
  );

  console.log("RESULT: PASS");
};

const runTests = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing.");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "saheli_safar",
    });

    console.log("Connected Database:", mongoose.connection.name);

    const password = crypto.randomBytes(18).toString("base64url");
    const passwordHash = await bcrypt.hash(password, 12);

    for (const status of ["pending", "suspended"]) {
      const user = await User.create({
        fullName: "Login Status Passenger",
        email: `login.${crypto.randomInt(1e9)}@test.local`,
        phone: generateTestPhone(),
        passwordHash,
        role: "passenger",
        status,
        isEmailVerified: true,
      });

      createdUserIds.push(user._id);

      await testLogin(user.phone, password, status);
    }

    console.log("\n✅ ALL ACCOUNT STATUS TESTS PASSED");
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState === 1) {
      if (createdUserIds.length > 0) {
        await User.deleteMany({
          _id: { $in: createdUserIds },
        });

        console.log("\nTemporary test accounts removed.");
      }

      await mongoose.disconnect();
    }
  }
};

runTests();
