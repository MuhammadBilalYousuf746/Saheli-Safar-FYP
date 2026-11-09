import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Disconnected models only: no .env, server, database client or email transport.
mongoose.set("autoCreate", false);
mongoose.set("autoIndex", false);
const { default: User } = await import("../src/modules/auth/user.model.js");
const { default: PassengerProfile } = await import("../src/modules/passenger/passenger.model.js");
const { default: DriverProfile } = await import("../src/modules/driver/driver.model.js");
const { default: AdminProfile } = await import("../src/modules/admin/admin.model.js");
const { completePassengerProfile, getPassengerProfile } = await import("../src/modules/passenger/passenger.service.js");
const { requireAuth, requireAdminPermission } = await import("../src/modules/auth/auth.middleware.js");
const { createAccessToken, verifyAccessToken } = await import("../src/modules/auth/token.service.js");
process.env.JWT_ACCESS_SECRET = "isolated-registration-integrity-secret-at-least-32-characters";

const id = "0123456789abcdef01234567";
const ownerIndex = { key: { user: 1 }, unique: true, name: "user_1" };
const input = { userId: id, password: "IsolatedOnly123!", confirmPassword: "IsolatedOnly123!" };
const clone = (value) => structuredClone(value);
const matches = (value, filter) => value && Object.entries(filter).every(([key, expected]) => String(value[key]) === String(expected));
const query = (run) => ({ select() { return this; }, session() { return this; }, then(yes, no) { return Promise.resolve().then(run).then(yes, no); } });

function fixture(t) {
  const state = {
    user: { _id: id, fullName: "Isolated Passenger", email: "isolated@example.invalid", phone: "+923001234567", role: "passenger", status: "pending", isEmailVerified: true, authVersion: 0 },
    profiles: [], indexes: [clone(ownerIndex)], events: [], failCreate: false, failActivation: false, failCommit: false,
  };
  t.mock.method(mongoose, "connect", () => { throw new Error("Database connections are forbidden in this test."); });
  t.mock.method(mongoose.connection, "openUri", () => { throw new Error("Database connections are forbidden in this test."); });
  t.mock.method(bcrypt, "hash", async () => "isolated-hash");
  t.mock.method(PassengerProfile, "init", async () => { state.events.push("init"); });
  t.mock.method(PassengerProfile, "listIndexes", async () => { state.events.push("indexes"); return clone(state.indexes); });
  t.mock.method(User, "findOne", (filter) => query(() => matches(state.user, filter) ? clone(state.user) : null));
  t.mock.method(User, "findById", (userId) => query(() => userId === state.user._id ? clone(state.user) : null));
  t.mock.method(PassengerProfile, "findOne", (filter) => query(() => clone(state.profiles.find((profile) => matches(profile, filter)) || null)));
  const session = { isolated: true };
  t.mock.method(PassengerProfile, "create", async (documents, options) => {
    assert.equal(options.session, session);
    assert.deepEqual(documents, [{ user: id }]);
    state.events.push("profile");
    if (state.failCreate) throw new Error("Isolated profile failure");
    if (state.profiles.some((profile) => profile.user === id)) throw Object.assign(new Error("Duplicate owner"), { code: 11000, keyPattern: { user: 1 } });
    const profile = new PassengerProfile(documents[0]).toObject();
    state.profiles.push({ user: id, emergencyContact: profile.emergencyContact });
    return [profile];
  });
  t.mock.method(User, "findOneAndUpdate", async (filter, update, options) => {
    assert.equal(options.session, session);
    assert.equal(options.runValidators, true);
    state.events.push("activation");
    if (state.failActivation || !matches(state.user, filter)) return null;
    Object.assign(state.user, update.$set);
    return clone(state.user);
  });
  t.mock.method(mongoose.connection, "transaction", async (callback) => {
    state.events.push("transaction");
    const before = clone({ user: state.user, profiles: state.profiles });
    try {
      const result = await callback(session);
      if (state.failCommit) throw new Error("Isolated commit failure");
      state.events.push("commit");
      return result;
    } catch (error) {
      Object.assign(state, before);
      state.events.push("rollback");
      throw error;
    }
  });
  return state;
}

const unavailable = (error) => error.statusCode === 503 && !/index|namespace|database/i.test(error.message);

test("fresh completion waits for the owner index and commits one profile before returning access", async (t) => {
  const state = fixture(t);
  const result = await completePassengerProfile(input);
  assert.deepEqual(state.events, ["init", "indexes", "transaction", "profile", "activation", "commit"]);
  assert.equal(state.user.status, "active");
  assert.deepEqual(state.profiles, [{ user: id, emergencyContact: null }]);
  assert.equal(verifyAccessToken(result.accessToken).userId, id);
  assert.equal("passwordHash" in result.user, false);
});

test("registration cannot start its transaction while initial index creation is pending", async (t) => {
  const state = fixture(t);
  let release;
  const pending = new Promise((resolve) => { release = resolve; });
  t.mock.method(PassengerProfile, "init", () => pending);
  const completion = completePassengerProfile(input);
  await Promise.resolve();
  assert.deepEqual(state.events, []);
  release();
  await completion;
  assert.equal(state.events[0], "indexes");
});

test("a collection dropped after cached initialization cannot activate an account without its owner index", async (t) => {
  const state = fixture(t);
  state.indexes = [];
  await assert.rejects(completePassengerProfile(input), unavailable);
  assert.deepEqual(state.events, ["init", "indexes"]);
  assert.equal(state.user.status, "pending");
  assert.deepEqual(state.profiles, []);
});

test("non-unique, compound, sparse and partial owner indexes cannot substitute for the declared constraint", async (t) => {
  const state = fixture(t);
  for (const index of [
    { key: { user: 1 } },
    { key: { user: 1, createdAt: 1 }, unique: true },
    { ...ownerIndex, sparse: true },
    { ...ownerIndex, partialFilterExpression: { active: true } },
  ]) {
    state.indexes = [index];
    await assert.rejects(completePassengerProfile(input), unavailable);
  }
  assert.equal(state.events.includes("transaction"), false);
});

test("initialization and metadata errors fail safely without creating profiles or activating users", async (t) => {
  const state = fixture(t);
  const failure = async () => { throw new Error("Private metadata failure"); };
  t.mock.method(PassengerProfile, "listIndexes", failure);
  await assert.rejects(completePassengerProfile(input), unavailable);
  t.mock.method(PassengerProfile, "init", failure);
  await assert.rejects(completePassengerProfile(input), unavailable);
  assert.equal(state.events.includes("transaction"), false);
  assert.equal(state.user.status, "pending");
});

test("profile failure leaves the pending identity intact", async (t) => {
  const state = fixture(t); state.failCreate = true;
  await assert.rejects(completePassengerProfile(input), /Isolated profile failure/);
  assert.equal(state.user.status, "pending");
  assert.equal("passwordHash" in state.user, false);
  assert.deepEqual(state.profiles, []);
  assert.equal(state.events.includes("activation"), false);
});

test("activation or commit failure rolls back the inserted profile", async (t) => {
  const state = fixture(t);
  for (const field of ["failActivation", "failCommit"]) {
    state[field] = true;
    await assert.rejects(completePassengerProfile(input));
    assert.equal(state.user.status, "pending");
    assert.equal("passwordHash" in state.user, false);
    assert.deepEqual(state.profiles, []);
    state[field] = false;
  }
});

test("duplicate profile completion is rejected without replacing saved contact data", async (t) => {
  const state = fixture(t);
  const existing = { user: id, emergencyContact: { name: "Saved Person", phone: "+923009876543", relationship: "Sister" } };
  state.profiles.push(clone(existing));
  await assert.rejects(completePassengerProfile(input), { statusCode: 409 });
  assert.deepEqual(state.profiles, [existing]);
  assert.equal(state.user.status, "pending");
});

test("wrong-role, unverified and already-active identities cannot create Passenger profiles", async (t) => {
  const state = fixture(t);
  const baseline = clone(state.user);
  for (const changes of [{ role: "driver" }, { role: "admin" }, { isEmailVerified: false }, { status: "active" }]) {
    state.user = { ...baseline, ...changes };
    await assert.rejects(completePassengerProfile(input), { statusCode: 403 });
    assert.deepEqual(state.profiles, []);
  }
});

test("invalid completion input is rejected before model initialization or metadata reads", async (t) => {
  const state = fixture(t);
  await assert.rejects(completePassengerProfile({ ...input, role: "admin" }), { name: "ZodError" });
  assert.deepEqual(state.events, []);
});

test("an old active identity with a missing profile gets 404 and is never backfilled", async (t) => {
  const state = fixture(t); state.user.status = "active";
  const before = clone(state.user);
  await assert.rejects(getPassengerProfile(id), { statusCode: 404 });
  assert.deepEqual(state.user, before);
  assert.deepEqual(state.profiles, []);
  assert.deepEqual(state.events, []);
});

test("role profiles declare required immutable unique owners without duplicating authentication fields", async () => {
  assert.deepEqual(User.schema.path("role").enumValues, ["passenger", "driver", "admin"]);
  for (const model of [PassengerProfile, DriverProfile, AdminProfile]) {
    const owner = model.schema.path("user");
    assert.equal(owner.options.ref, "User");
    assert.equal(owner.options.required, true);
    assert.equal(owner.options.immutable, true);
    assert.ok(model.schema.indexes().some(([key, options]) => key.user === 1 && Object.keys(key).length === 1 && options.unique));
    for (const field of ["email", "passwordHash", "role"]) assert.equal(model.schema.path(field), undefined);
  }
  assert.equal(PassengerProfile.collection.name, "passengerprofiles");
  assert.equal(DriverProfile.collection.name, "driverprofiles");
  assert.equal(AdminProfile.collection.name, "adminprofiles");
  assert.equal(User.schema.path("passwordHash").options.select, false);
});

test("role middleware denies every cross-role access and rechecks admin management permission", async (t) => {
  const state = fixture(t); state.user.status = "active";
  const response = () => ({ code: 200, status(code) { this.code = code; return this; }, json() { return this; } });
  for (const role of ["passenger", "driver", "admin"]) {
    state.user.role = role;
    const accessToken = createAccessToken(state.user);
    for (const required of ["passenger", "driver", "admin"].filter((value) => value !== role)) {
      const res = response(); let passed = false;
      await requireAuth(required)({ get: () => `Bearer ${accessToken}` }, res, () => { passed = true; });
      assert.equal(res.code, 403); assert.equal(passed, false);
    }
  }
  const req = { user: { id, role: "admin", permissions: ["manageAdmins"] } };
  state.user.permissions = [];
  const denied = response(); let passed = false;
  await requireAdminPermission("manageAdmins")(req, denied, () => { passed = true; });
  assert.equal(denied.code, 403); assert.equal(passed, false);
  state.user.permissions = ["manageAdmins"];
  await requireAdminPermission("manageAdmins")(req, response(), () => { passed = true; });
  assert.equal(passed, true);
});
