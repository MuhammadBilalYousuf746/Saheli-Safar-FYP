import assert from "node:assert/strict";
import test from "node:test";

import DriverProfile from "../src/modules/driver/driver.model.js";
import User from "../src/modules/auth/user.model.js";
import {
  requireAdminPermission,
  requireAuth,
} from "../src/modules/auth/auth.middleware.js";
import { getAdminOverview } from "../src/modules/admin/admin.service.js";

const makeQuery = (records) => ({
  populate() {
    return this;
  },
  sort() {
    return this;
  },
  skip() {
    return this;
  },
  limit() {
    return this;
  },
  select() {
    return this;
  },
  then(resolve, reject) {
    return Promise.resolve(records).then(resolve, reject);
  },
});

const withOverviewData = async (run) => {
  const original = {
    driverFind: DriverProfile.find,
    driverCount: DriverProfile.countDocuments,
    userFind: User.find,
    userCount: User.countDocuments,
  };
  const pendingDriver = {
    _id: "507f1f77bcf86cd799439011",
    user: {
      _id: "507f1f77bcf86cd799439012",
      fullName: "Test Driver",
      phone: "private-phone",
      email: "private-email",
    },
    cnic: "private-cnic",
    licenseNumber: "private-license",
    vehicle: {
      make: "Test",
      model: "Vehicle",
      plateNumber: "TEST-123",
    },
    verificationStatus: "pending",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  };
  const driverCounts = { pending: 2, approved: 4, rejected: 1 };
  const userCounts = {
    passenger: 8,
    driver: 5,
    suspended: 3,
  };

  DriverProfile.find = (filter) =>
    makeQuery(
      filter.verificationStatus === "pending" ? [pendingDriver] : []
    );
  DriverProfile.countDocuments = async (filter) =>
    driverCounts[filter.verificationStatus];
  User.find = () => makeQuery([]);
  User.countDocuments = async (filter) => {
    if (filter.role === "passenger") return userCounts.passenger;
    if (filter.role === "driver") return userCounts.driver;
    if (filter.status === "suspended") return userCounts.suspended;
    return 0;
  };

  try {
    await run();
  } finally {
    DriverProfile.find = original.driverFind;
    DriverProfile.countDocuments = original.driverCount;
    User.find = original.userFind;
    User.countDocuments = original.userCount;
  }
};

const runPermission = async (permissions, role = "admin") => {
  const originalFindById = User.findById;
  User.findById = () => ({
    select: async () => ({
      role,
      status: "active",
      permissions,
    }),
  });

  const req = { user: { id: "admin-id", role: "admin" } };
  let status;
  let nextCalled = false;
  const res = {
    status(code) {
      status = code;
      return this;
    },
    json() {
      return this;
    },
  };

  try {
    await requireAdminPermission("manageAdmins")(req, res, () => {
      nextCalled = true;
    });
    return { status, nextCalled };
  } finally {
    User.findById = originalFindById;
  }
};

test("Full Access permission allows the Overview summary boundary", async () => {
  assert.deepEqual(await runPermission(["manageAdmins"]), {
    status: undefined,
    nextCalled: true,
  });
});

test("Standard Access is forbidden from the Overview summary boundary", async () => {
  assert.deepEqual(await runPermission([]), {
    status: 403,
    nextCalled: false,
  });
});

test("non-admins are forbidden from the Overview summary boundary", async () => {
  assert.deepEqual(await runPermission([], "passenger"), {
    status: 403,
    nextCalled: false,
  });
});

test("unauthenticated requests are rejected before permission checks", async () => {
  const req = { get: () => "" };
  let status;
  let nextCalled = false;
  const res = {
    status(code) {
      status = code;
      return this;
    },
    json() {
      return this;
    },
  };

  await requireAuth("admin")(req, res, () => {
    nextCalled = true;
  });

  assert.equal(status, 401);
  assert.equal(nextCalled, false);
});

test("Overview summary preserves count meanings and limits pending preview data", async () => {
  await withOverviewData(async () => {
    const result = await getAdminOverview();

    assert.deepEqual(result.stats, {
      pending: 2,
      approved: 4,
      rejected: 1,
      passengers: 8,
      drivers: 5,
      suspended: 3,
    });
    assert.deepEqual(result.recentPending, [
      {
        id: "507f1f77bcf86cd799439012",
        fullName: "Test Driver",
        vehicle: {
          make: "Test",
          model: "Vehicle",
          plateNumber: "TEST-123",
        },
        submittedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ]);
    assert.equal(JSON.stringify(result).includes("private-phone"), false);
    assert.equal(JSON.stringify(result).includes("private-email"), false);
    assert.equal(JSON.stringify(result).includes("private-cnic"), false);
    assert.equal(JSON.stringify(result).includes("private-license"), false);
  });
});
