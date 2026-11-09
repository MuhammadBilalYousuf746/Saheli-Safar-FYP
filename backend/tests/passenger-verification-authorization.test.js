import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

mongoose.set("autoCreate", false);
mongoose.set("autoIndex", false);
const { createAdminVerificationRoutes, createPassengerVerificationRoutes } = await import("../src/modules/verification/verification.routes.js");
const { createMongooseVerificationRepo, createVerificationService } = await import("../src/modules/verification/verification.service.js");
const { createVerificationStorage } = await import("../src/modules/verification/verification-storage.js");
const { default: User } = await import("../src/modules/auth/user.model.js");
const { default: PassengerProfile } = await import("../src/modules/passenger/passenger.model.js");
const { VerificationReview } = await import("../src/modules/verification/verification.model.js");
const { createAccessToken } = await import("../src/modules/auth/token.service.js");
const { errorHandler } = await import("../src/middlewares/errorHandler.js");

// No dotenv import, database connection, real accounts or provider SDK calls.
process.env.JWT_ACCESS_SECRET = "isolated-passenger-review-authorization-secret";
const actorId = "222222222222222222222222", passengerId = "0123456789abcdef01234567";
const prefix = "/api/admin/passenger-verifications";
const both = ["manageAdmins", "verifyPassengers"];
const operations = [
  { path: "", method: "GET" },
  { path: `/${passengerId}`, method: "GET" },
  { path: `/${passengerId}/documents/cnic-0`, method: "GET" },
  { path: `/${passengerId}/documents/selfie`, method: "GET" },
  ...["approved", "rejected", "reverification_requested"].map(decision => ({ path: `/${passengerId}/review`, method: "POST", body: { decision, reason: "Synthetic test reason", revision: 1, submissionId: "00000000-0000-4000-8000-000000000000", permissions: both, accessLevel: "full" } })),
];

async function serve(t, routes, mount = prefix) {
  t.mock.method(mongoose, "connect", () => { throw new Error("Live MongoDB is forbidden"); });
  const app = express(); app.use(express.json()); app.use(mount, routes); app.use(errorHandler);
  const server = app.listen(0, "127.0.0.1"); await new Promise(resolve => server.once("listening", resolve));
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });
  return `http://127.0.0.1:${server.address().port}`;
}

const cases = [
  { name: "Full Access with explicit verification capability", permissions: both, expected: 200 },
  { name: "Full Access without verification capability", permissions: ["manageAdmins"], expected: 403 },
  { name: "Standard Access with accidental verification capability", permissions: ["verifyPassengers"], expected: 403 },
  { name: "Standard Access without verification capability", permissions: [], expected: 403 },
  { name: "Passenger even with both permission strings", role: "passenger", permissions: both, expected: 403 },
  { name: "Driver even with both permission strings", role: "driver", permissions: both, expected: 403 },
  { name: "inactive Admin with both permissions", status: "disabled", permissions: both, expected: 403 },
  { name: "expired Admin token", token: "expired", permissions: both, expected: 401 },
  { name: "invalid token", token: "invalid", permissions: both, expected: 401 },
  { name: "missing token", token: "missing", permissions: both, expected: 401 },
  { name: "revoked Admin token", token: "revoked", permissions: both, expected: 401 },
];

for (const scenario of cases) test(`all Admin verification operations: ${scenario.name}`, async t => {
  const account = { _id: actorId, role: scenario.role || "admin", status: scenario.status || "active", permissions: [...scenario.permissions], authVersion: 0 };
  let calls = 0;
  t.mock.method(User, "findById", () => ({ select: async () => account }));
  const service = {
    queue: async () => { calls++; return { submissions: [] }; },
    detail: async () => { calls++; return { verification: {} }; },
    document: async () => { calls++; return Buffer.from([255, 216, 255, 217]); },
    decide: async () => { calls++; return { status: "test-fixture" }; },
  };
  // Issue before a possible deactivation, then authorize against current state.
  let token = createAccessToken({ ...account, status: "active" });
  if (scenario.token === "expired") token = jwt.sign({ tokenType: "access", role: "admin", authVersion: 0 }, process.env.JWT_ACCESS_SECRET, { algorithm: "HS256", subject: actorId, issuer: "saheli-safar-api", audience: "saheli-safar-apps", expiresIn: -1 });
  if (scenario.token === "invalid") token = "invalid-test-token";
  if (scenario.token === "revoked") account.authVersion++;
  const base = await serve(t, createAdminVerificationRoutes(service));
  for (const operation of operations) {
    const response = await fetch(base + prefix + operation.path, {
      method: operation.method,
      headers: { ...(scenario.token !== "missing" ? { Authorization: `Bearer ${token}` } : {}), "Content-Type": "application/json" },
      ...(operation.body ? { body: JSON.stringify(operation.body) } : {}),
    });
    assert.equal(response.status, scenario.expected, `${operation.method} ${operation.path} ${operation.body?.decision || ""}`);
    await response.arrayBuffer();
  }
  assert.equal(calls, scenario.expected === 200 ? operations.length : 0, "Denied direct requests must never reach verification handlers");
});

test("current database permissions override a previously issued Admin token", async t => {
  const account = { _id: actorId, role: "admin", status: "active", permissions: [...both], authVersion: 0 };
  const token = createAccessToken(account); let calls = 0;
  t.mock.method(User, "findById", () => ({ select: async () => account }));
  const base = await serve(t, createAdminVerificationRoutes({ queue: async () => { calls++; return { submissions: [] }; } }));
  for (const permissions of [[...both], ["verifyPassengers"], ["manageAdmins"], []]) {
    account.permissions = permissions;
    const result = await fetch(base + prefix, { headers: { Authorization: `Bearer ${token}` } });
    assert.equal(result.status, permissions.length === 2 ? 200 : 403); await result.arrayBuffer();
  }
  assert.equal(calls, 1, "JWT claims cannot preserve permission after the current database account changes");
});

test("review transaction rechecks Full Access and capability before changing status or history", async t => {
  const session = { isolated: true };
  t.mock.method(VerificationReview, "init", async () => {});
  t.mock.method(mongoose.connection, "transaction", async callback => callback(session));
  t.mock.method(User, "findOne", filter => ({ session: async actual => {
    assert.equal(actual, session); assert.equal(filter.role, "admin"); assert.equal(filter.status, "active");
    assert.deepEqual(filter.permissions, { $all: both });
    return null; // Demoted/revoked since the HTTP permission check.
  } }));
  const update = t.mock.method(PassengerProfile, "findOneAndUpdate", () => { throw new Error("Must not update profile"); });
  const history = t.mock.method(VerificationReview, "create", () => { throw new Error("Must not create history"); });
  const repo = createMongooseVerificationRepo();
  for (const decision of ["approved", "rejected", "reverification_requested"]) await assert.rejects(repo.review(passengerId, actorId, { decision }), { statusCode: 403 });
  assert.equal(update.mock.callCount(), 0); assert.equal(history.mock.callCount(), 0);
});

test("GET verification me reports real not-submitted state and disabled-service availability separately", async t => {
  const env = { CLOUDINARY_CLOUD_NAME: "isolated", CLOUDINARY_API_KEY: "fake-key", CLOUDINARY_API_SECRET: "fake-secret", VERIFICATION_SUBMISSIONS_ENABLED: "false" };
  const storage = createVerificationStorage({ env, sdk: {}, fetchImpl: () => { throw new Error("Provider requests forbidden"); } });
  const profile = { verificationStatus: "not_submitted", verificationRevision: 0, verificationAssets: [] };
  const account = { _id: passengerId, role: "passenger", status: "active", authVersion: 0 };
  t.mock.method(User, "findById", () => ({ select: async () => account }));
  const service = createVerificationService({ storage, repo: { owned: async owner => { assert.equal(owner, passengerId); return { profile }; } } });
  const base = await serve(t, createPassengerVerificationRoutes(service), "/api/passenger/verification");
  const get = async () => {
    const response = await fetch(base + "/api/passenger/verification/me", { headers: { Authorization: `Bearer ${createAccessToken(account)}` } });
    assert.equal(response.status, 200); return (await response.json()).verification;
  };
  assert.deepEqual(await get(), { status: "not_submitted", revision: 0, submissionId: null, submittedAt: null, reviewedAt: null, rejectionReason: null, reverificationReason: null, submissionAvailable: false, documentsDeleted: false, documents: [] });
  assert.throws(() => storage.assertAvailable(), { statusCode: 503 });
  env.VERIFICATION_SUBMISSIONS_ENABLED = "true"; // Fake object only, not process.env or any .env file.
  assert.equal((await get()).submissionAvailable, true);
  env.CLOUDINARY_API_SECRET = ""; assert.equal((await get()).submissionAvailable, false);
  env.CLOUDINARY_API_SECRET = "fake-secret"; profile.documentsDeletedAt = new Date(); assert.equal((await get()).submissionAvailable, false);
});
