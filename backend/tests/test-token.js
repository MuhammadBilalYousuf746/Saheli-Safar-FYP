
import "dotenv/config";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";

import {
  createOnboardingToken,
  verifyOnboardingToken,
  createAccessToken,
  verifyAccessToken,
} from "../src/modules/auth/token.service.js";

const userId = crypto.randomBytes(12).toString("hex");

const pendingPassenger = {
  _id: userId,
  role: "passenger",
  status: "pending",
  isEmailVerified: true,
};

const activePassenger = {
  _id: userId,
  role: "passenger",
  status: "active",
  isEmailVerified: true,
};

const runTests = () => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Tests cannot run in production.");
  }

  for (const key of [
    "JWT_ACCESS_SECRET",
    "JWT_ONBOARDING_SECRET",
  ]) {
    if (Buffer.byteLength(process.env[key] || "") < 32) {
      throw new Error(`${key} is missing or too short.`);
    }
  }

  console.log("\n🧪 JWT TOKEN SECURITY TESTS\n");

  // TEST 1: Generate onboarding token.
  const onboardingToken = createOnboardingToken(
    pendingPassenger
  );

  assert.equal(typeof onboardingToken, "string");

  console.log("✅ Onboarding token generated");

  // TEST 2: Verify onboarding token.
  const onboardingPayload = verifyOnboardingToken(
    onboardingToken
  );

  assert.equal(onboardingPayload.userId, userId);
  assert.equal(onboardingPayload.tokenType, "onboarding");

  console.log("✅ Onboarding token verified");

  // TEST 3: Block unverified passengers.
  assert.throws(() =>
    createOnboardingToken({
      ...pendingPassenger,
      isEmailVerified: false,
    })
  );

  console.log("✅ Unverified passenger blocked");

  // TEST 4: Block onboarding token as access token.
  assert.throws(() =>
    verifyAccessToken(onboardingToken)
  );

  console.log("✅ Onboarding token cannot access protected APIs");

  // TEST 5: Block access token for pending account.
  assert.throws(() =>
    createAccessToken(pendingPassenger)
  );

  console.log("✅ Pending account cannot receive access token");

  // TEST 6: Generate and verify access token.
  const accessToken = createAccessToken(
    activePassenger
  );

  const accessPayload = verifyAccessToken(accessToken);

  assert.equal(accessPayload.userId, userId);
  assert.equal(accessPayload.role, "passenger");
  assert.equal(accessPayload.tokenType, "access");

  console.log("✅ Active passenger access token verified");

  // TEST 7: Access token cannot be used for onboarding.
  assert.throws(() =>
    verifyOnboardingToken(accessToken)
  );

  console.log("✅ Access token cannot replace onboarding token");

  // TEST 8: Reject unauthorized roles.
  assert.throws(() =>
    createAccessToken({
      ...activePassenger,
      role: "superadmin",
    })
  );

  console.log("✅ Invalid roles rejected");

  // TEST 9: Reject tampered tokens.
  const tokenParts = accessToken.split(".");
  const signature = tokenParts[2];

  tokenParts[2] =
    (signature[0] === "A" ? "B" : "A") +
    signature.slice(1);

  const tamperedToken = tokenParts.join(".");

  assert.throws(() =>
    verifyAccessToken(tamperedToken)
  );

  console.log("✅ Tampered token rejected");

  // TEST 10: Reject expired access token.
  const expiredToken = jwt.sign(
    {
      tokenType: "access",
      role: "passenger",
    },
    process.env.JWT_ACCESS_SECRET,
    {
      algorithm: "HS256",
      subject: userId,
      issuer: "saheli-safar-api",
      audience: "saheli-safar-apps",
      expiresIn: -1,
    }
  );

  assert.throws(
    () => verifyAccessToken(expiredToken),
    (error) => error.name === "TokenExpiredError"
  );

  console.log("✅ Expired token rejected");

  console.log("\n🎉 All JWT security tests passed!");
};

try {
  runTests();
} catch (error) {
  console.error("\n❌ JWT test failed:", error.message);
  process.exitCode = 1;
}
