import assert from "node:assert/strict";
import test from "node:test";

import DriverProfile from "../src/modules/driver/driver.model.js";
import { updateDriverVerification } from "../src/modules/admin/admin.service.js";
import {
  driverVerificationSchema,
  listDriversQuerySchema,
  userIdParamsSchema,
} from "../src/modules/admin/admin.validation.js";

const USER_ID = "507f1f77bcf86cd799439011";
const ADMIN_ID = "507f1f77bcf86cd799439012";

const withDriverStubs = async (
  { updatedProfile = null, driverExists = false },
  run
) => {
  const originalFindOneAndUpdate = DriverProfile.findOneAndUpdate;
  const originalExists = DriverProfile.exists;
  const calls = [];

  DriverProfile.findOneAndUpdate = (filter, update, options) => {
    calls.push({ filter, update, options });
    return {
      populate: async () => updatedProfile,
    };
  };
  DriverProfile.exists = async () => driverExists;

  try {
    await run(calls);
  } finally {
    DriverProfile.findOneAndUpdate = originalFindOneAndUpdate;
    DriverProfile.exists = originalExists;
  }
};

test("driver list query validates supported statuses and pagination", () => {
  assert.deepEqual(
    listDriversQuerySchema.parse({ verificationStatus: "pending" }),
    {
      verificationStatus: "pending",
      page: 1,
      limit: 20,
    }
  );
  assert.throws(
    () => listDriversQuerySchema.parse({ verificationStatus: "unknown" }),
    /Invalid option/
  );
  assert.throws(
    () => listDriversQuerySchema.parse({ page: 0 }),
    /Too small/
  );
});

test("driver ID and verification schemas reject invalid values", () => {
  assert.throws(
    () => userIdParamsSchema.parse({ userId: "not-an-object-id" }),
    /Invalid resource identifier/
  );
  assert.throws(
    () => driverVerificationSchema.parse({ status: "pending" }),
    /Invalid option/
  );
  assert.throws(
    () => driverVerificationSchema.parse({ status: "rejected", reason: "  " }),
    /reason/
  );
  assert.equal(
    driverVerificationSchema.parse({
      status: "rejected",
      reason: "  Documents do not match.  ",
    }).reason,
    "Documents do not match."
  );
});

test("verification update atomically records a decision only from pending", async () => {
  const updatedProfile = {
    user: {
      _id: USER_ID,
      fullName: "Test Driver",
      phone: "+923001234567",
      email: "driver@example.com",
      role: "driver",
      status: "active",
      isEmailVerified: true,
    },
    cnic: "00000-0000000-0",
    licenseNumber: "TEST-LICENSE",
    vehicle: {},
    verificationStatus: "approved",
    rejectionReason: null,
    verifiedBy: ADMIN_ID,
    verifiedAt: new Date("2026-01-01T00:00:00.000Z"),
    createdAt: new Date("2025-12-01T00:00:00.000Z"),
  };

  await withDriverStubs({ updatedProfile }, async (calls) => {
    const result = await updateDriverVerification({
      userId: USER_ID,
      status: "approved",
      adminId: ADMIN_ID,
    });

    assert.deepEqual(calls[0].filter, {
      user: USER_ID,
      verificationStatus: "pending",
    });
    assert.equal(calls[0].update.$set.verificationStatus, "approved");
    assert.equal(calls[0].update.$set.verifiedBy, ADMIN_ID);
    assert.ok(calls[0].update.$set.verifiedAt instanceof Date);
    assert.equal(calls[0].options.runValidators, true);
    assert.equal(result.verificationStatus, "approved");
    assert.equal(result.verifiedAt, updatedProfile.verifiedAt);
  });
});

test("verification update rejects an already-decided driver without overwriting", async () => {
  await withDriverStubs({ driverExists: true }, async (calls) => {
    await assert.rejects(
      () =>
        updateDriverVerification({
          userId: USER_ID,
          status: "rejected",
          reason: "Already reviewed",
          adminId: ADMIN_ID,
        }),
      (error) =>
        error.statusCode === 409 &&
        error.message === "Driver verification has already been decided."
    );
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0].filter, {
      user: USER_ID,
      verificationStatus: "pending",
    });
  });
});

test("verification update reports a missing driver", async () => {
  await withDriverStubs({}, async () => {
    await assert.rejects(
      () =>
        updateDriverVerification({
          userId: USER_ID,
          status: "approved",
          adminId: ADMIN_ID,
        }),
      (error) => error.statusCode === 404
    );
  });
});
