import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";

import User from "../src/modules/auth/user.model.js";
import { requireAdminPermission } from "../src/modules/auth/auth.middleware.js";
import AdminProfile from "../src/modules/admin/admin.model.js";
import AdminAccessAudit from "../src/modules/admin/admin-access-audit.model.js";
import AdminAccessLock from "../src/modules/admin/admin-access-lock.model.js";
import AdminEmailChange from "../src/modules/admin/admin-email-change.model.js";
import {
  createAdminAccount,
  listAdmins,
  provisionFirstAdmin,
  updateAdminAccess,
} from "../src/modules/admin/admin.service.js";
import {
  createAdminSchema,
  listAdminsQuerySchema,
  updateAdminAccessSchema,
} from "../src/modules/admin/admin.validation.js";

test("user permissions default to an empty array", () => {
  const user = new User({ role: "admin" });
  assert.deepEqual(user.permissions, []);
});

const withUserStubs = (overrides = {}) => {
  const originalFindOne = User.findOne;
  const originalFindById = User.findById;
  const originalCreate = User.create;
  const originalFind = User.find;
  const originalUpdateOne = User.updateOne;
  const originalCountDocuments = User.countDocuments;
  const originalTransaction = mongoose.connection.transaction;
  const originalAdminCreate = AdminProfile.create;
  const originalLockUpdateOne = AdminAccessLock.updateOne;
  const originalLockFindOneAndUpdate = AdminAccessLock.findOneAndUpdate;
  const originalAuditCreate = AdminAccessAudit.create;
  const originalPendingEmailFindOne = AdminEmailChange.findOne;
  const originalPendingEmailFind = AdminEmailChange.find;
  const originalPendingEmailDeleteMany = AdminEmailChange.deleteMany;

  User.findOne = overrides.findOne || originalFindOne;
  User.findById = overrides.findById || originalFindById;
  User.create = overrides.create || originalCreate;
  User.find = overrides.find || originalFind;
  User.updateOne = overrides.updateOne || originalUpdateOne;
  User.countDocuments = overrides.countDocuments || originalCountDocuments;
  mongoose.connection.transaction =
    overrides.transaction || originalTransaction;
  AdminProfile.create = overrides.adminCreate || originalAdminCreate;
  AdminAccessLock.updateOne =
    overrides.lockUpdateOne || originalLockUpdateOne;
  AdminAccessLock.findOneAndUpdate =
    overrides.lockFindOneAndUpdate || originalLockFindOneAndUpdate;
  AdminAccessAudit.create = overrides.auditCreate || originalAuditCreate;
  AdminEmailChange.findOne =
    overrides.pendingEmailFindOne ||
    (() => ({ session: async () => null }));
  AdminEmailChange.find =
    overrides.pendingEmailFind ||
    (() => ({ select: async () => [] }));
  AdminEmailChange.deleteMany =
    overrides.pendingEmailDeleteMany || (async () => ({ deletedCount: 0 }));

  return () => {
    User.findOne = originalFindOne;
    User.findById = originalFindById;
    User.create = originalCreate;
    User.find = originalFind;
    User.updateOne = originalUpdateOne;
    User.countDocuments = originalCountDocuments;
    mongoose.connection.transaction = originalTransaction;
    AdminProfile.create = originalAdminCreate;
    AdminAccessLock.updateOne = originalLockUpdateOne;
    AdminAccessLock.findOneAndUpdate = originalLockFindOneAndUpdate;
    AdminAccessAudit.create = originalAuditCreate;
    AdminEmailChange.findOne = originalPendingEmailFindOne;
    AdminEmailChange.find = originalPendingEmailFind;
    AdminEmailChange.deleteMany = originalPendingEmailDeleteMany;
  };
};

const authorizedManagerQuery = () => ({
  select: () => ({
    session: async () => ({
      role: "admin",
      status: "active",
      permissions: ["manageAdmins"],
    }),
  }),
});

test("admin creation schema normalizes and validates fields", () => {
  const payload = createAdminSchema.parse({
    fullName: "  Test Admin  ",
    email: "TEST@EXAMPLE.COM",
    password: "StrongPass1",
    confirmPassword: "StrongPass1",
    accessLevel: "full",
  });

  assert.equal(payload.fullName, "Test Admin");
  assert.equal(payload.email, "test@example.com");
  assert.equal(payload.password, "StrongPass1");
  assert.throws(
    () =>
      createAdminSchema.parse({
        fullName: "Test Admin",
        email: "test@example.com",
        password: "StrongPass1",
        confirmPassword: "StrongPass1",
        role: "admin",
      }),
    /Unrecognized key/i
  );
});

test("admin creation defaults to Standard Access and validates access levels", () => {
  const payload = createAdminSchema.parse({
    fullName: "Test Admin",
    email: "test@example.com",
    password: "StrongPass1",
    confirmPassword: "StrongPass1",
  });

  assert.equal(payload.accessLevel, "standard");
  assert.equal(
    updateAdminAccessSchema.parse({ accessLevel: "full" }).accessLevel,
    "full"
  );
  assert.throws(
    () => updateAdminAccessSchema.parse({ accessLevel: "super" }),
    /Invalid option/i
  );
});

test("admin creation schema rejects invalid passwords", () => {
  assert.throws(
    () =>
      createAdminSchema.parse({
        fullName: "Test Admin",
        email: "test@example.com",
        password: "short",
        confirmPassword: "short",
      }),
    /Password must be at least 8 characters/i
  );
});

test("first-admin bootstrap is one-time and provisions Full Access without a public route", async () => {
  let createdUser;
  const restore = withUserStubs({
    lockUpdateOne: async () => ({}),
    lockFindOneAndUpdate: async () => ({}),
    countDocuments: () => ({
      session: async () => 0,
    }),
    create: async ([data]) => {
      createdUser = data;
      return [{ _id: "507f1f77bcf86cd799439015", ...data }];
    },
    transaction: async (callback) => callback({}),
    adminCreate: async () => [{}],
  });

  try {
    const admin = await provisionFirstAdmin({
      fullName: "First Admin",
      email: "first@example.com",
      password: "StrongPass1",
    });

    assert.equal(admin.role, "admin");
    assert.deepEqual(createdUser.permissions, ["manageAdmins"]);
    assert.equal(createdUser.status, "active");
  } finally {
    restore();
  }
});

test("first-admin bootstrap refuses to create an account when an admin exists", async () => {
  let createCalled = false;
  const restore = withUserStubs({
    lockUpdateOne: async () => ({}),
    lockFindOneAndUpdate: async () => ({}),
    countDocuments: () => ({
      session: async () => 1,
    }),
    create: async () => {
      createCalled = true;
      return [];
    },
    transaction: async (callback) => callback({}),
  });

  try {
    await assert.rejects(
      () =>
        provisionFirstAdmin({
          fullName: "Second Admin",
          email: "second@example.com",
          password: "StrongPass1",
        }),
      (error) => error.statusCode === 409
    );
    assert.equal(createCalled, false);
  } finally {
    restore();
  }
});

test("createAdminAccount ignores public role flags and hashes the password", async () => {
  const restore = withUserStubs({
    findById: authorizedManagerQuery,
    lockUpdateOne: async () => ({}),
    lockFindOneAndUpdate: async () => ({}),
    findOne: () => ({
      select: async () => null,
    }),
    create: async (docs) => [
      {
        _id: "507f1f77bcf86cd799439011",
        fullName: docs[0].fullName,
        email: docs[0].email,
        role: docs[0].role,
        status: docs[0].status,
        isEmailVerified: docs[0].isEmailVerified,
        permissions: docs[0].permissions,
      },
    ],
    transaction: async (callback) => callback({}),
    adminCreate: async () => [{}],
  });

  try {
    const admin = await createAdminAccount({
      fullName: "   Test Admin  ",
      email: "TEST@EXAMPLE.COM",
      password: "StrongPass1",
      role: "passenger",
      permissions: ["manageAdmins"],
      accessLevel: "full",
      createdBy: "507f1f77bcf86cd799439012",
    });

    assert.equal(admin.role, "admin");
    assert.deepEqual(admin.permissions, ["manageAdmins"]);
    assert.equal(admin.email, "test@example.com");
    assert.ok(admin.id);
  } finally {
    restore();
  }
});

test("createAdminAccount defaults new admins to Standard Access", async () => {
  let createdDocument;
  const restore = withUserStubs({
    findById: authorizedManagerQuery,
    lockUpdateOne: async () => ({}),
    lockFindOneAndUpdate: async () => ({}),
    findOne: () => ({
      select: async () => null,
    }),
    create: async (documents) => {
      createdDocument = documents[0];
      return [
        {
          _id: "507f1f77bcf86cd799439013",
          ...createdDocument,
        },
      ];
    },
    transaction: async (callback) => callback({}),
    adminCreate: async () => [{}],
  });

  try {
    await createAdminAccount({
      fullName: "Standard Admin",
      email: "standard@example.com",
      password: "StrongPass1",
      createdBy: "507f1f77bcf86cd799439012",
    });
    assert.deepEqual(createdDocument.permissions, []);
  } finally {
    restore();
  }
});

test("createAdminAccount rejects a Standard Access creator", async () => {
  let createCalled = false;
  const restore = withUserStubs({
    findById: () => ({
      select() {
        return this;
      },
      session: async () => ({
        role: "admin",
        status: "active",
        permissions: [],
      }),
    }),
    lockUpdateOne: async () => ({}),
    lockFindOneAndUpdate: async () => ({}),
    findOne: () => ({
      select: async () => null,
    }),
    create: async () => {
      createCalled = true;
      return [];
    },
    transaction: async (callback) => callback({}),
  });

  try {
    await assert.rejects(
      () =>
        createAdminAccount({
          fullName: "Forbidden Admin",
          email: "forbidden@example.com",
          password: "StrongPass1",
          accessLevel: "full",
          createdBy: "standard-admin-id",
        }),
      (error) =>
        error.statusCode === 403 &&
        error.message.includes("permission to manage admin")
    );
    assert.equal(createCalled, false);
  } finally {
    restore();
  }
});

test("createAdminAccount rejects duplicate emails", async () => {
  const restore = withUserStubs({
    findOne: () => ({
      select: async () => ({ role: "admin" }),
    }),
  });

  try {
    await assert.rejects(
      () =>
        createAdminAccount({
          fullName: "Test Admin",
          email: "test@example.com",
          password: "StrongPass1",
        }),
      /already exists/i
    );
  } finally {
    restore();
  }
});

test("createAdminAccount translates concurrent email uniqueness conflicts", async () => {
  const duplicateKeyError = Object.assign(
    new Error("Duplicate key"),
    { code: 11000, keyPattern: { email: 1 } }
  );
  const restore = withUserStubs({
    lockUpdateOne: async () => ({}),
    lockFindOneAndUpdate: async () => ({}),
    findOne: () => ({
      select: async () => null,
    }),
    transaction: async () => {
      throw duplicateKeyError;
    },
  });

  try {
    await assert.rejects(
      () =>
        createAdminAccount({
          fullName: "Test Admin",
          email: "test@example.com",
          password: "StrongPass1",
        }),
      (error) =>
        error.statusCode === 409 &&
        error.message.includes("test@example.com")
    );
  } finally {
    restore();
  }
});

test("listAdmins exposes existing admin accounts", async () => {
  const restore = withUserStubs({
    find: () => ({
      select: () => ({
        sort: () => ({
          skip: () => ({
            limit: async () => [
              {
                _id: "507f1f77bcf86cd799439011",
                fullName: "Primary Admin",
                email: "admin@example.com",
                role: "admin",
                status: "active",
                isEmailVerified: true,
                permissions: ["manageAdmins"],
                createdAt: new Date("2024-01-01T00:00:00Z"),
                lastLoginAt: null,
              },
            ],
          }),
        }),
      }),
    }),
    countDocuments: async () => 1,
    pendingEmailFind: () => ({
      select: async () => [
        {
          user: { toString: () => "507f1f77bcf86cd799439011" },
          email: "pending@example.com",
        },
      ],
    }),
  });

  try {
    const result = await listAdmins({ page: 1, limit: 20 });
    assert.equal(result.admins.length, 1);
    assert.equal(result.admins[0].email, "admin@example.com");
    assert.deepEqual(result.admins[0].permissions, ["manageAdmins"]);
    assert.equal(result.admins[0].accessLevel, "full");
    assert.equal(result.admins[0].pendingEmail, "pending@example.com");
  } finally {
    restore();
  }
});

test("updateAdminAccess preserves unrelated permissions and audits downgrades", async () => {
  const target = {
    _id: "target-id",
    fullName: "Target Admin",
    email: "target@example.com",
    role: "admin",
    status: "active",
    permissions: ["manageReports", "manageAdmins"],
    createdAt: new Date("2024-01-01T00:00:00Z"),
  };
  const auditRecords = [];
  const query = (user) => ({
    select() {
      return this;
    },
    session: async () => user,
  });
  const restore = withUserStubs({
    lockUpdateOne: async () => ({}),
    lockFindOneAndUpdate: async () => ({}),
    findById: (id) =>
      query(
        id === "actor-id"
          ? {
              role: "admin",
              status: "active",
              permissions: ["manageAdmins"],
            }
          : target
      ),
    findOne: () => query(target),
    countDocuments: () => ({
      session: async () => 1,
    }),
    updateOne: async (_filter, update) => {
      target.permissions = update.$set.permissions;
      return { modifiedCount: 1 };
    },
    auditCreate: async (records) => {
      auditRecords.push(...records);
      return records;
    },
    transaction: async (callback) => callback({}),
  });

  try {
    const result = await updateAdminAccess({
      userId: "target-id",
      accessLevel: "standard",
      changedBy: "actor-id",
    });

    assert.equal(result.accessLevel, "standard");
    assert.deepEqual(target.permissions, ["manageReports"]);
    assert.deepEqual(auditRecords[0], {
      changedBy: "actor-id",
      targetAdmin: "target-id",
      previousAccessLevel: "full",
      newAccessLevel: "standard",
    });
  } finally {
    restore();
  }
});

test("updateAdminAccess prevents self-revocation", async () => {
  const target = {
    _id: "actor-id",
    fullName: "Full Admin",
    email: "full@example.com",
    role: "admin",
    status: "active",
    permissions: ["manageAdmins"],
  };
  const query = {
    select() {
      return this;
    },
    session: async () => target,
  };
  const restore = withUserStubs({
    lockUpdateOne: async () => ({}),
    lockFindOneAndUpdate: async () => ({}),
    findById: () => query,
    findOne: () => query,
    transaction: async (callback) => callback({}),
  });

  try {
    await assert.rejects(
      () =>
        updateAdminAccess({
          userId: "actor-id",
          accessLevel: "standard",
          changedBy: "actor-id",
        }),
      (error) =>
        error.statusCode === 403 &&
        error.message.includes("own Full Access")
    );
    assert.deepEqual(target.permissions, ["manageAdmins"]);
  } finally {
    restore();
  }
});

test("updateAdminAccess rejects a Standard Access actor", async () => {
  const query = {
    select() {
      return this;
    },
    session: async () => ({
      role: "admin",
      status: "active",
      permissions: [],
    }),
  };
  const restore = withUserStubs({
    lockUpdateOne: async () => ({}),
    lockFindOneAndUpdate: async () => ({}),
    findById: () => query,
    transaction: async (callback) => callback({}),
  });

  try {
    await assert.rejects(
      () =>
        updateAdminAccess({
          userId: "target-id",
          accessLevel: "full",
          changedBy: "standard-admin-id",
        }),
      (error) =>
        error.statusCode === 403 &&
        error.message.includes("permission to manage admin")
    );
  } finally {
    restore();
  }
});

test("updateAdminAccess prevents downgrading the last Full Access admin", async () => {
  const target = {
    _id: "target-id",
    fullName: "Last Full Admin",
    email: "full@example.com",
    role: "admin",
    status: "active",
    permissions: ["manageAdmins"],
  };
  const query = (user) => ({
    select() {
      return this;
    },
    session: async () => user,
  });
  let updateCalled = false;
  const restore = withUserStubs({
    lockUpdateOne: async () => ({}),
    lockFindOneAndUpdate: async () => ({}),
    findById: () =>
      query({
        role: "admin",
        status: "active",
        permissions: ["manageAdmins"],
      }),
    findOne: () => query(target),
    countDocuments: () => ({
      session: async () => 0,
    }),
    updateOne: async () => {
      updateCalled = true;
    },
    transaction: async (callback) => callback({}),
  });

  try {
    await assert.rejects(
      () =>
        updateAdminAccess({
          userId: "target-id",
          accessLevel: "standard",
          changedBy: "actor-id",
        }),
      (error) =>
        error.statusCode === 409 &&
        error.message.includes("last Full Access")
    );
    assert.equal(updateCalled, false);
  } finally {
    restore();
  }
});

test("admin management middleware forbids non-admins", async () => {
  const req = { user: { id: "user-id", role: "passenger" } };
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

  await requireAdminPermission("manageAdmins")(req, res, () => {
    nextCalled = true;
  });

  assert.equal(status, 403);
  assert.equal(nextCalled, false);
});

test("admin management middleware forbids admins without manageAdmins", async () => {
  const originalFindById = User.findById;
  User.findById = () => ({
    select: async () => ({
      role: "admin",
      status: "active",
      permissions: [],
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

    assert.equal(status, 403);
    assert.equal(nextCalled, false);
  } finally {
    User.findById = originalFindById;
  }
});

test("admin management middleware allows an active admin with manageAdmins", async () => {
  const originalFindById = User.findById;
  User.findById = () => ({
    select: async () => ({
      role: "admin",
      status: "active",
      permissions: ["manageAdmins"],
    }),
  });

  const req = { user: { id: "admin-id", role: "admin" } };
  let nextCalled = false;
  const res = {
    status(code) {
      assert.fail(`Unexpected response status ${code}`);
    },
    json() {
      assert.fail("Unexpected response body");
    },
  };

  try {
    await requireAdminPermission("manageAdmins")(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.deepEqual(req.user.permissions, ["manageAdmins"]);
  } finally {
    User.findById = originalFindById;
  }
});

test("listAdminsQuerySchema accepts pagination defaults", () => {
  const query = listAdminsQuerySchema.parse({});
  assert.equal(query.page, 1);
  assert.equal(query.limit, 20);
});
