import assert from "node:assert/strict";
import test from "node:test";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import User from "../src/modules/auth/user.model.js";
import { requireAuth } from "../src/modules/auth/auth.middleware.js";
import { loginAdmin } from "../src/modules/admin/admin.service.js";
import AdminAccessLock from "../src/modules/admin/admin-access-lock.model.js";
import AdminEmailChange from "../src/modules/admin/admin-email-change.model.js";
import AdminManagementAudit from "../src/modules/admin/admin-management-audit.model.js";
import {
  deactivateAdminAccount,
  requestAdminEmailChange,
  verifyAdminEmailChange,
} from "../src/modules/admin/admin.service.js";
import {
  deactivateAdminSchema,
  updateAdminEmailSchema,
} from "../src/modules/admin/admin.validation.js";

const MANAGER_ID = "507f1f77bcf86cd799439021";
const TARGET_ID = "507f1f77bcf86cd799439022";

const makeQuery = (value) => ({
  select() {
    return this;
  },
  session: async () => value,
});

const withStubs = async (
  {
    managerPermissions = ["manageAdmins"],
    targetPermissions = [],
    duplicateAccount = false,
    otherFullAccessAdmins = 1,
  } = {},
  run
) => {
  const original = {
    findById: User.findById,
    findOne: User.findOne,
    updateOne: User.updateOne,
    countDocuments: User.countDocuments,
    transaction: mongoose.connection.transaction,
    lockUpdateOne: AdminAccessLock.updateOne,
    lockFindOneAndUpdate: AdminAccessLock.findOneAndUpdate,
    emailFindOne: AdminEmailChange.findOne,
    emailFindOneAndUpdate: AdminEmailChange.findOneAndUpdate,
    emailCreate: AdminEmailChange.create,
    emailDeleteMany: AdminEmailChange.deleteMany,
    emailDeleteOne: AdminEmailChange.deleteOne,
    auditCreate: AdminManagementAudit.create,
  };
  const passwordHash = await bcrypt.hash("CorrectPass1", 4);
  const manager = {
    _id: MANAGER_ID,
    role: "admin",
    status: "active",
    permissions: managerPermissions,
    passwordHash,
    fullName: "Managing Admin",
    email: "manager@example.com",
    isEmailVerified: true,
  };
  const target = {
    _id: TARGET_ID,
    role: "admin",
    status: "active",
    fullName: "Target Admin",
    email: "target@example.com",
    permissions: targetPermissions,
  };
  const state = {
    audits: [],
    pending: null,
    update: null,
    duplicateAccount,
    otherFullAccessAdmins,
    token: null,
  };

  User.findById = (id) => makeQuery(id.toString() === MANAGER_ID ? manager : null);
  User.findOne = (filter) => {
    if (filter._id === TARGET_ID && filter.role === "admin") {
      return makeQuery(filter.status === "active" ? target : null);
    }
    if (filter._id === MANAGER_ID && filter.role === "admin") {
      return makeQuery(filter.status === "active" ? manager : null);
    }
    if (filter.email && filter._id?.$ne === TARGET_ID) {
      return makeQuery(state.duplicateAccount ? { _id: "other-user" } : null);
    }
    return makeQuery(null);
  };
  User.updateOne = async (_filter, update) => {
    state.update = update;
    if (update.$set?.status) target.status = update.$set.status;
    if (update.$set?.email) target.email = update.$set.email;
    return { matchedCount: 1 };
  };
  User.countDocuments = () => ({
    session: async () => state.otherFullAccessAdmins,
  });
  mongoose.connection.transaction = async (callback) => callback({});
  AdminAccessLock.updateOne = async () => ({});
  AdminAccessLock.findOneAndUpdate = async () => ({});
  AdminEmailChange.findOne = (filter) => ({
    session: async () => {
      if (filter.email) {
        return state.pending?.email === filter.email ? state.pending : null;
      }
      return state.pending?.tokenHash === filter.tokenHash
        ? state.pending
        : null;
    },
  });
  AdminEmailChange.findOneAndUpdate = async (filter, update) => {
    if (state.pending?.user.toString() !== filter.user) return null;
    state.pending = {
      ...state.pending,
      ...update.$set,
    };
    return state.pending;
  };
  AdminEmailChange.create = async ([data]) => {
    state.pending = {
      ...data,
      _id: "email-change-record",
      user: data.user,
      changedBy: data.changedBy,
    };
    state.token = data.tokenHash;
    return [state.pending];
  };
  AdminEmailChange.deleteMany = async () => {
    state.pending = null;
    return { deletedCount: 1 };
  };
  AdminEmailChange.deleteOne = async () => {
    state.pending = null;
    return { deletedCount: 1 };
  };
  AdminManagementAudit.create = async (records) => {
    state.audits.push(...records);
    return records;
  };

  try {
    await run(state);
  } finally {
    User.findById = original.findById;
    User.findOne = original.findOne;
    User.updateOne = original.updateOne;
    User.countDocuments = original.countDocuments;
    mongoose.connection.transaction = original.transaction;
    AdminAccessLock.updateOne = original.lockUpdateOne;
    AdminAccessLock.findOneAndUpdate = original.lockFindOneAndUpdate;
    AdminEmailChange.findOne = original.emailFindOne;
    AdminEmailChange.findOneAndUpdate = original.emailFindOneAndUpdate;
    AdminEmailChange.create = original.emailCreate;
    AdminEmailChange.deleteMany = original.emailDeleteMany;
    AdminEmailChange.deleteOne = original.emailDeleteOne;
    AdminManagementAudit.create = original.auditCreate;
  }
};

test("admin sensitive-action schemas normalize and reject invalid input", () => {
  assert.equal(
    updateAdminEmailSchema.parse({
      email: "  NEW@Example.com ",
      password: "CorrectPass1",
    }).email,
    "new@example.com"
  );
  assert.throws(
    () =>
      updateAdminEmailSchema.parse({
        email: "not-an-email",
        password: "CorrectPass1",
      }),
    /valid email/i
  );
  assert.throws(
    () =>
      deactivateAdminSchema.parse({
        password: "CorrectPass1",
        confirmation: "delete",
      }),
    /DELETE/
  );
});

test("Full Access admin can request email change and target address must verify", async () => {
  await withStubs({}, async (state) => {
    let emailed;
    const response = await requestAdminEmailChange({
      userId: TARGET_ID,
      email: " NEW@EXAMPLE.COM ",
      password: "CorrectPass1",
      changedBy: MANAGER_ID,
      sendEmail: async (payload) => {
        emailed = payload;
      },
    });

    assert.match(response.message, /verification link/i);
    assert.equal(emailed.to, "new@example.com");
    assert.equal(emailed.token.length, 43);
    assert.notEqual(state.pending.tokenHash, emailed.token);
    assert.equal(state.update, null);
    assert.equal(state.audits[0].result, "pending");
    assert.equal(state.audits[0].previousEmail, "target@example.com");
    assert.equal(state.audits[0].newEmail, "new@example.com");
  });
});

test("Standard Admin can change their own email after password re-verification", async () => {
  await withStubs({ managerPermissions: [] }, async (state) => {
    const messages = [];
    await requestAdminEmailChange({
      userId: MANAGER_ID,
      email: "new-manager@example.com",
      password: "CorrectPass1",
      changedBy: MANAGER_ID,
      sendEmail: async (message) => messages.push(message),
      notifyPreviousEmail: async (message) => messages.push(message),
    });

    assert.equal(messages.length, 2);
    assert.equal(messages[0].to, "new-manager@example.com");
    assert.equal(messages[1].to, "manager@example.com");
    assert.equal(state.pending.user.toString(), MANAGER_ID);
  });
});

test("Standard Admin is forbidden from requesting an email change", async () => {
  await withStubs({ managerPermissions: [] }, async (state) => {
    await assert.rejects(
      () =>
        requestAdminEmailChange({
          userId: TARGET_ID,
          email: "new@example.com",
          password: "CorrectPass1",
          changedBy: MANAGER_ID,
          sendEmail: async () => {},
        }),
      (error) => error.statusCode === 403
    );
    assert.equal(state.pending, null);
  });
});

test("duplicate account email is rejected", async () => {
  await withStubs({ duplicateAccount: true }, async () => {
    await assert.rejects(
      () =>
        requestAdminEmailChange({
          userId: TARGET_ID,
          email: "taken@example.com",
          password: "CorrectPass1",
          changedBy: MANAGER_ID,
          sendEmail: async () => {},
        }),
      (error) => error.statusCode === 409
    );
  });
});

test("email change requires password re-verification and confirmed ownership", async () => {
  await withStubs({}, async (state) => {
    await assert.rejects(
      () =>
        requestAdminEmailChange({
          userId: TARGET_ID,
          email: "new@example.com",
          password: "WrongPass1",
          changedBy: MANAGER_ID,
          sendEmail: async () => {},
        }),
      (error) => error.statusCode === 401
    );
    assert.equal(state.pending, null);
  });

  await withStubs({}, async (state) => {
    const emailed = [];
    await requestAdminEmailChange({
      userId: TARGET_ID,
      email: "new@example.com",
      password: "CorrectPass1",
      changedBy: MANAGER_ID,
      sendEmail: async (message) => emailed.push(message),
    });
    const pending = state.pending;
    const token = emailed[0].token;
    const { createHash } = await import("node:crypto");
    assert.equal(
      pending.tokenHash,
      createHash("sha256").update(token).digest("hex")
    );

    const result = await verifyAdminEmailChange({ token });

    assert.match(result.message, /updated successfully/i);
    assert.equal(state.update.$set.email, "new@example.com");
    assert.equal(state.update.$inc.authVersion, 1);
    assert.equal(state.audits.some((audit) => audit.result === "success"), true);
    assert.equal(state.pending, null);
    await assert.rejects(
      () => verifyAdminEmailChange({ token }),
      (error) => error.statusCode === 400
    );
  });
});

test("an admin can change their own email and failed delivery clears the pending request", async () => {
  await withStubs({}, async (state) => {
    await requestAdminEmailChange({
      userId: MANAGER_ID,
      email: "new@example.com",
      password: "CorrectPass1",
      changedBy: MANAGER_ID,
      sendEmail: async () => {},
    });
    assert.equal(state.pending.email, "new@example.com");
  });

  await withStubs({}, async (state) => {
    await assert.rejects(
      () =>
        requestAdminEmailChange({
          userId: TARGET_ID,
          email: "new@example.com",
          password: "CorrectPass1",
          changedBy: MANAGER_ID,
          sendEmail: async () => {
            throw Object.assign(new Error("SMTP failure"), {
              code: "ECONNECTION",
            });
          },
        }),
      (error) => error.statusCode === 503
    );
    assert.equal(state.pending, null);
    assert.equal(state.audits.some((audit) => audit.result === "failed"), true);
  });
});

test("Full Access admin can deactivate another active admin and revoke sessions", async () => {
  await withStubs({}, async (state) => {
    const result = await deactivateAdminAccount({
      userId: TARGET_ID,
      password: "CorrectPass1",
      confirmation: "DELETE",
      changedBy: MANAGER_ID,
    });

    assert.match(result.message, /deactivated/i);
    assert.equal(state.update.$set.status, "deactivated");
    assert.equal(state.update.$set.deactivatedBy, MANAGER_ID);
    assert.equal(state.update.$inc.authVersion, 1);
    assert.equal(state.audits[0].action, "deactivation");
    assert.equal(state.audits[0].result, "success");
  });
});

test("Standard Admin cannot deactivate another admin", async () => {
  await withStubs({ managerPermissions: [] }, async () => {
    await assert.rejects(
      () =>
        deactivateAdminAccount({
          userId: TARGET_ID,
          password: "CorrectPass1",
          confirmation: "DELETE",
          changedBy: MANAGER_ID,
        }),
      (error) => error.statusCode === 403
    );
  });
});

test("Standard Admin can deactivate their own account with password and explicit confirmation", async () => {
  await withStubs({ managerPermissions: [] }, async (state) => {
    const result = await deactivateAdminAccount({
      userId: MANAGER_ID,
      password: "CorrectPass1",
      confirmation: "DELETE",
      changedBy: MANAGER_ID,
    });

    assert.match(result.message, /deactivated/i);
    assert.equal(state.update.$set.status, "deactivated");
    assert.equal(state.update.$inc.authVersion, 1);
  });
});

test("Full Access admin cannot self-deactivate when they are the last active Full Access admin", async () => {
  await withStubs(
    { managerPermissions: ["manageAdmins"], otherFullAccessAdmins: 0 },
    async (state) => {
      await assert.rejects(
        () =>
          deactivateAdminAccount({
            userId: MANAGER_ID,
            password: "CorrectPass1",
            confirmation: "DELETE",
            changedBy: MANAGER_ID,
          }),
        (error) => error.statusCode === 409
      );
      assert.equal(state.update, null);
    }
  );
});

test("the last active Full Access admin cannot deactivate another Full Access admin", async () => {
  await withStubs(
    { targetPermissions: ["manageAdmins"], otherFullAccessAdmins: 0 },
    async (state) => {
      await assert.rejects(
        () =>
          deactivateAdminAccount({
            userId: TARGET_ID,
            password: "CorrectPass1",
            confirmation: "DELETE",
            changedBy: MANAGER_ID,
          }),
        (error) => error.statusCode === 409
      );
      assert.equal(state.update, null);
      assert.equal(state.audits.at(-1).result, "failed");
    }
  );
});

test("deactivated admins cannot log in or use previously issued access tokens", async () => {
  const oldSecret = process.env.JWT_ACCESS_SECRET;
  process.env.JWT_ACCESS_SECRET =
    "test-secret-that-is-long-enough-for-access-token";
  const originalFindOne = User.findOne;
  const originalFindById = User.findById;
  const passwordHash = await bcrypt.hash("CorrectPass1", 4);
  User.findOne = () => ({
    select: async () => ({
      _id: TARGET_ID,
      email: "target@example.com",
      role: "admin",
      status: "deactivated",
      permissions: ["manageAdmins"],
      passwordHash,
    }),
  });

  try {
    await assert.rejects(
      () =>
        loginAdmin({
          email: "target@example.com",
          password: "CorrectPass1",
        }),
      (error) => error.statusCode === 403
    );

    const token = jwt.sign(
      {
        tokenType: "access",
        role: "admin",
        authVersion: 0,
      },
      process.env.JWT_ACCESS_SECRET,
      {
        algorithm: "HS256",
        subject: TARGET_ID,
        issuer: "saheli-safar-api",
        audience: "saheli-safar-apps",
        expiresIn: "5m",
      }
    );
    User.findById = () => ({
      select: async () => ({
        _id: TARGET_ID,
        email: "target@example.com",
        role: "admin",
        status: "deactivated",
        permissions: ["manageAdmins"],
        authVersion: 1,
      }),
    });

    let responseStatus;
    let responseBody;
    await requireAuth("admin")(
      {
        get: () => `Bearer ${token}`,
      },
      {
        status: (value) => {
          responseStatus = value;
          return {
            json: (body) => {
              responseBody = body;
            },
          };
        },
      },
      (error) => {
        throw error || new Error("Deactivated token unexpectedly passed.");
      }
    );

    assert.equal(responseStatus, 403);
    assert.match(responseBody.message, /not active/i);
  } finally {
    User.findOne = originalFindOne;
    User.findById = originalFindById;
    if (oldSecret === undefined) delete process.env.JWT_ACCESS_SECRET;
    else process.env.JWT_ACCESS_SECRET = oldSecret;
  }
});
