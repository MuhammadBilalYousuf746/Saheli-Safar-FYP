import assert from "node:assert/strict";
import test from "node:test";
import User from "../src/modules/auth/user.model.js";
import DriverProfile from "../src/modules/driver/driver.model.js";
import AdminEmailChange from "../src/modules/admin/admin-email-change.model.js";
import { listUsersController } from "../src/modules/admin/admin.controller.js";
import { listUsersQuerySchema } from "../src/modules/admin/admin.validation.js";
import { getAdminOverview, listAdmins, listDrivers } from "../src/modules/admin/admin.service.js";

// All model reads are replaced. No connection, writes, or database fixtures.
const accounts = [
  { _id: "p1", role: "passenger", fullName: "Passenger One (VIP)", email: "shared@example.test", phone: "+923001234567", status: "active" },
  { _id: "d1", role: "driver", fullName: "Driver One", email: "shared@example.test", phone: "+923001234567", status: "suspended" },
  { _id: "a1", role: "admin", fullName: "Admin One", email: "shared@example.test", status: "active" },
  { _id: "p2", role: "passenger", fullName: "Passenger Two", status: "suspended" },
  { _id: "d2", role: "driver", fullName: "Driver Two", status: "active" },
  { _id: "p3", role: "passenger", fullName: "Passenger Three", status: "active" },
];
const matches = (item, filter) => Object.entries(filter).every(([key, value]) => {
  if (key === "$or") return value.some(clause => matches(item, clause));
  if (value?.$regex !== undefined) return new RegExp(value.$regex, value.$options).test(item[key] || "");
  return value?.$in ? value.$in.includes(item[key]) : item[key] === value;
});
const query = (records) => ({
  offset: 0, size: records.length,
  select() { return this; }, populate() { return this; }, sort() { return this; },
  skip(value) { this.offset = value; return this; },
  limit(value) { this.size = value; return this; },
  then(resolve, reject) { return Promise.resolve(records.slice(this.offset, this.offset + this.size)).then(resolve, reject); },
});

const withReads = async (run) => {
  const originals = [User.find, User.countDocuments, DriverProfile.find, DriverProfile.countDocuments, AdminEmailChange.find];
  const calls = [];
  User.find = (filter) => { calls.push(["find", filter]); return query(accounts.filter(item => matches(item, filter))); };
  User.countDocuments = async (filter) => { calls.push(["count", filter]); return accounts.filter(item => matches(item, filter)).length; };
  const profiles = accounts.filter(item => item.role === "driver").map(user => ({
    _id: `profile-${user._id}`, user, verificationStatus: "pending", vehicle: {},
  }));
  DriverProfile.find = (filter) => query(profiles.filter(item => matches(item, filter)));
  DriverProfile.countDocuments = async (filter) => profiles.filter(item => matches(item, filter)).length;
  AdminEmailChange.find = () => query([]);
  try { await run(calls); }
  finally { [User.find, User.countDocuments, DriverProfile.find, DriverProfile.countDocuments, AdminEmailChange.find] = originals; }
};

const directory = async (params = {}) => {
  let result, failure;
  const response = { status(code) { assert.equal(code, 200); return this; }, json(body) { result = body; } };
  await listUsersController({ query: params }, response, error => { failure = error; });
  if (failure) throw failure;
  return result;
};

test("directory defaults to stored passenger roles and excludes drivers/admins", () => withReads(async calls => {
  const data = await directory();
  assert.deepEqual(data.users.map(user => user.id), ["p1", "p2", "p3"]);
  assert.equal(data.pagination.total, 3);
  assert.deepEqual(calls, [["find", { role: "passenger" }], ["count", { role: "passenger" }]]);
}));

test("passenger filtering precedes pagination and uses the same count filter", () => withReads(async calls => {
  const first = await directory({ limit: "2" });
  const second = await directory({ page: "2", limit: "2" });
  assert.deepEqual(first.users.map(user => user.id), ["p1", "p2"]);
  assert.deepEqual(second.users.map(user => user.id), ["p3"]);
  assert.deepEqual(second.pagination, { page: 2, limit: 2, total: 3, totalPages: 2 });
  assert.ok(calls.every(([, filter]) => filter.role === "passenger"));
}));

test("account-status filtering excludes matching driver accounts", () => withReads(async () => {
  const data = await directory({ status: "suspended" });
  assert.deepEqual(data.users.map(user => user.id), ["p2"]);
  assert.equal(data.pagination.total, 1);
}));

test("empty passenger status results retain accurate pagination", () => withReads(async () => {
  const data = await directory({ status: "disabled" });
  assert.deepEqual(data.users, []);
  assert.equal(data.pagination.total, 0);
  assert.equal(data.pagination.totalPages, 0);
}));

test("explicit driver API queries remain compatible and Drivers uses its profile source", () => withReads(async () => {
  const legacy = await directory({ role: "driver" });
  const drivers = await listDrivers({ page: 1, limit: 20 });
  assert.deepEqual(legacy.users.map(user => user.id), ["d1", "d2"]);
  assert.deepEqual(drivers.drivers.map(user => user.id), ["d1", "d2"]);
}));

test("admin roles and unsupported parameters are rejected before querying", () => {
  assert.throws(() => listUsersQuerySchema.parse({ role: "admin" }));
  assert.throws(() => listUsersQuerySchema.parse({ unknown: "Driver" }));
  assert.throws(() => listUsersQuerySchema.parse({ verificationStatus: "approved" }));
});

test("passenger search matches authorized name, email and normalized mobile fields only", () => withReads(async () => {
  for (const search of ["one (vip)", "SHARED@EXAMPLE", "0300 123-4567", "+92 300 1234567"]) {
    const data = await directory({ search });
    assert.deepEqual(data.users.map(user => user.id), ["p1"]);
    assert.equal(data.pagination.total, 1);
    assert.equal(Object.hasOwn(data.users[0], "passwordHash"), false);
  }
  assert.deepEqual((await directory({ search: "Driver One" })).users, []);
  assert.deepEqual((await directory({ search: "Admin One" })).users, []);
}));

test("search and account status are applied before pagination with identical count filters", () => withReads(async calls => {
  const data = await directory({ search: "Passenger", status: "active", page: "2", limit: "1" });
  assert.deepEqual(data.users.map(user => user.id), ["p3"]);
  assert.deepEqual(data.pagination, { page: 2, limit: 1, total: 2, totalPages: 2 });
  assert.deepEqual(calls[0][1], calls[1][1]);
  assert.equal(calls[0][1].role, "passenger");
  assert.equal(calls[0][1].status, "active");
}));

test("search is literal, bounded and validated without weakening legacy driver queries", () => withReads(async () => {
  for (const search of [".*", "(a+)+$", "$ne", "[", "\\"]) {
    assert.equal((await directory({ search })).pagination.total, 0);
  }
  assert.equal(listUsersQuerySchema.parse({ search: "  Passenger  " }).search, "Passenger");
  assert.equal((await directory({ search: "   " })).pagination.total, 3);
  for (const search of ["x".repeat(101), { $ne: null }, ["Passenger"], "name\u0000value", "name\nvalue"]) {
    assert.throws(() => listUsersQuerySchema.parse({ search }));
  }
  await assert.rejects(directory({ role: "driver", search: "shared" }), /passengers only/);
  assert.equal((await directory({ role: "driver" })).pagination.total, 2);
}));

test("Admin Management retains its separate administrator-only population", () => withReads(async () => {
  const data = await listAdmins({ page: 1, limit: 20 });
  assert.deepEqual(data.admins.map(user => user.id), ["a1"]);
  assert.equal(data.pagination.total, 1);
}));

test("Overview and the unfiltered directory count the same passenger population", () => withReads(async () => {
  const overview = await getAdminOverview();
  const passengers = await directory({ limit: "1" });
  assert.equal(overview.stats.passengers, passengers.pagination.total);
  assert.equal(overview.stats.passengers, 3);
  assert.equal(overview.stats.drivers, 2);
  assert.equal(overview.stats.suspended, 2);
}));

test("directory read errors reach the existing error middleware", () => withReads(async () => {
  User.find = () => { throw new Error("Fixture read failure"); };
  await assert.rejects(directory(), /Fixture read failure/);
}));
