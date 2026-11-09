import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import express from "express";
import User from "../src/modules/auth/user.model.js";
import Notification from "../src/modules/admin/admin-notification.model.js";
import PassengerProfile from "../src/modules/passenger/passenger.model.js";
import { createMongooseVerificationRepo } from "../src/modules/verification/verification.service.js";
import { createNotificationService, notificationDto, notificationScope } from "../src/modules/admin/admin-notification.service.js";
import { createNotificationRoutes } from "../src/modules/admin/admin-notification.routes.js";
import { createAccessToken } from "../src/modules/auth/token.service.js";
import { errorHandler } from "../src/middlewares/errorHandler.js";
import DriverProfile from "../src/modules/driver/driver.model.js";
import { completeDriverProfile } from "../src/modules/driver/driver.service.js";
mongoose.set("autoCreate", false); mongoose.set("autoIndex", false);
const id = "222222222222222222222222";
const admin = { id, role: "admin", status: "active", permissions: ["manageAdmins", "verifyPassengers"] };

test("notification scope requires both passenger capabilities and never exposes documents", () => {
  for (const permissions of [[], ["manageAdmins"], ["verifyPassengers"]]) assert.deepEqual(notificationScope({ permissions }).type.$in, ["driver_verification"]);
  assert.equal(notificationScope(admin).type.$in.length, 2);
  const dto = notificationDto({ _id: "event", type: "passenger_identity", resubmission: true, createdAt: new Date(), readBy: [id], secret: "private" }, id);
  assert.equal(dto.read, true); assert.equal(dto.title, "Identity verification resubmitted"); assert.equal(dto.destination, "/passenger-verifications"); assert.equal(JSON.stringify(dto).includes("private"), false);
});

test("feed persists independent, idempotent per-admin read state and scopes every update", async () => {
  let event = { _id: "event", type: "driver_verification", createdAt: new Date(), readBy: [] };
  const model = {
    find: () => ({ sort: () => ({ limit: () => ({ lean: async () => [event] }) }) }),
    countDocuments: async filter => event.readBy.includes(filter.readBy.$ne) ? 0 : 1,
    updateOne: async (filter, update) => { assert.ok(filter.type.$in); if (filter._id !== event._id) return { matchedCount: 0 }; event.readBy = [...new Set([...event.readBy, update.$addToSet.readBy])]; return { matchedCount: 1 }; },
    updateMany: async (filter, update) => { assert.ok(filter.type.$in); assert.ok(filter.createdAt.$lte instanceof Date); event.readBy = [...new Set([...event.readBy, update.$addToSet.readBy])]; },
  };
  const service = createNotificationService(model);
  assert.equal((await service.list(admin)).unreadCount, 1);
  await Promise.all([service.read(admin, "event"), service.read(admin, "event")]);
  assert.equal((await createNotificationService(model).list(admin)).unreadCount, 0);
  assert.equal((await service.list({ ...admin, id: "other" })).unreadCount, 1);
  await service.readAll({ ...admin, id: "other" }, event.createdAt.toISOString());
  assert.equal((await service.list({ ...admin, id: "other" })).unreadCount, 0);
  await assert.rejects(service.read(admin, "missing"), /unavailable/);
  await assert.rejects(service.readAll(admin, "bad-date"), /Invalid/);
});

test("passenger CAS and deduplicated notification share a transaction; failed events propagate for rollback", async t => {
  const session = {}; let event, predicate, shouldFail = false;
  t.mock.method(Notification, "init", async () => {});
  t.mock.method(mongoose.connection, "transaction", async callback => callback(session));
  t.mock.method(PassengerProfile, "findOne", () => ({ session: async () => ({ verificationStatus: "rejected" }) }));
  t.mock.method(PassengerProfile, "findOneAndUpdate", (filter, update, options) => { predicate = filter; assert.equal(options.session, session); assert.deepEqual(update.$inc, { verificationRevision: 1 }); return { select: async () => ({ verificationStatus: "pending_review" }) }; });
  t.mock.method(Notification, "updateOne", async (filter, update, options) => { assert.equal(options.session, session); assert.equal(options.upsert, true); event = { filter, update }; if (shouldFail) throw new Error("event failed"); });
  const repo = createMongooseVerificationRepo();
  await repo.commitSubmission(id, 0, { submissionId: "same-submission" }, ["not_submitted", "rejected"]);
  assert.equal(predicate.$and[0].$or[1].verificationRevision.$exists, false);
  assert.equal(event.filter._id, "identity:same-submission"); assert.equal(event.update.$setOnInsert.resubmission, true);
  shouldFail = true; await assert.rejects(repo.commitSubmission(id, 0, { submissionId: "same-submission" }, ["rejected"]), /event failed/);
  t.mock.method(PassengerProfile, "findOneAndUpdate", () => ({ select: async () => null }));
  assert.equal(await repo.commitSubmission(id, 0, {}, ["rejected"]), null);
});

test("notification HTTP routes reject absent, expired, revoked, inactive and non-admin sessions", async t => {
  process.env.JWT_ACCESS_SECRET = "isolated-admin-notifications-secret-at-least-32";
  let account = { _id: id, role: "admin", status: "active", permissions: [], authVersion: 0 }, calls = 0;
  t.mock.method(User, "findById", () => ({ select: async () => account }));
  const service = { list: async actor => { calls++; assert.equal(actor.id, id); return { notifications: [], unreadCount: 0 }; }, read: async () => { calls++; }, readAll: async () => { calls++; } };
  const app = express(); app.use(express.json()); app.use("/notifications", createNotificationRoutes(service)); app.use(errorHandler);
  const server = app.listen(0, "127.0.0.1"); await new Promise(resolve => server.once("listening", resolve)); t.after(() => { server.closeAllConnections(); server.close(); });
  const base = `http://127.0.0.1:${server.address().port}/notifications`;
  const token = createAccessToken(account);
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  for (const [suffix, method, body] of [["", "GET"], ["/event/read", "POST"], ["/read-all", "POST", { before: new Date().toISOString() }]]) {
    assert.equal((await fetch(base + suffix, { method })).status, 401);
    assert.equal((await fetch(base + suffix, { method, headers: { Authorization: "Bearer expired" } })).status, 401);
    account.authVersion = 1; assert.equal((await fetch(base + suffix, { method, headers })).status, 401); account.authVersion = 0;
    account.status = "disabled"; assert.equal((await fetch(base + suffix, { method, headers })).status, 403); account.status = "active";
    assert.equal((await fetch(base + suffix, { method, headers, ...(body ? { body: JSON.stringify(body) } : {}) })).status, 200);
  }
  assert.equal(calls, 3);
  const passengerToken = createAccessToken({ ...account, role: "passenger" });
  assert.equal((await fetch(base, { headers: { Authorization: `Bearer ${passengerToken}` } })).status, 403);
});

test("driver onboarding records its review event in the activation transaction and fails atomically", async t => {
  process.env.JWT_ACCESS_SECRET = "isolated-admin-notifications-secret-at-least-32";
  const session = {}, driver = { _id: id, role: "driver", status: "pending", isEmailVerified: true };
  let fail = false, activated = false, event;
  t.mock.method(Notification, "init", async () => {});
  t.mock.method(mongoose.connection, "transaction", async callback => callback(session));
  t.mock.method(User, "findOne", () => ({ session: async value => { assert.equal(value, session); return driver; } }));
  t.mock.method(DriverProfile, "create", async (_rows, options) => { assert.equal(options.session, session); return [{ _id: id, verificationStatus: "pending" }]; });
  t.mock.method(Notification, "updateOne", async (filter, update, options) => { assert.equal(options.session, session); assert.equal(options.upsert, true); event = { filter, update }; if (fail) throw new Error("driver event failed"); });
  t.mock.method(User, "findOneAndUpdate", async (_filter, _update, options) => { assert.equal(options.session, session); activated = true; return { ...driver, status: "active" }; });
  const input = { userId: id, password: "SyntheticPass1!", confirmPassword: "SyntheticPass1!", cnic: "11111-1111111-1", licenseNumber: "TEST-123", vehicle: { type: "car", make: "Test", model: "Fixture", color: "Purple", year: 2020, plateNumber: "TEST123" } };
  const result = await completeDriverProfile(input);
  assert.equal(result.user.verificationStatus, "pending"); assert.equal(activated, true);
  assert.equal(event.filter._id, `driver:${id}`); assert.equal(event.update.$setOnInsert.type, "driver_verification");
  fail = true; activated = false; await assert.rejects(completeDriverProfile(input), /driver event failed/); assert.equal(activated, false);
});
