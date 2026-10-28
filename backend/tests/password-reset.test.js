import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import User from "../src/modules/auth/user.model.js";
import PasswordResetAttempt from "../src/modules/auth/password-reset-attempt.model.js";
import PasswordResetToken from "../src/modules/auth/password-reset-token.model.js";
import { requireAuth } from "../src/modules/auth/auth.middleware.js";
import {
  changePasswordSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
} from "../src/modules/auth/auth.validation.js";
import {
  changeAdminPassword,
  requestAdminPasswordReset,
  resetAdminPassword,
} from "../src/modules/auth/password-reset.service.js";

const hash = (value) =>
  createHash("sha256").update(value).digest("hex");

const withModelStubs = async (overrides, callback) => {
  const originals = [
    [User, "findOne"],
    [User, "updateOne"],
    [PasswordResetAttempt, "findOneAndUpdate"],
    [PasswordResetToken, "findOne"],
    [PasswordResetToken, "create"],
    [PasswordResetToken, "deleteMany"],
    [PasswordResetToken, "deleteOne"],
  ].map(([model, key]) => [model, key, model[key]]);
  const originalTransaction = mongoose.connection.transaction;
  const models = {
    [User.modelName]: User,
    [PasswordResetAttempt.modelName]: PasswordResetAttempt,
    [PasswordResetToken.modelName]: PasswordResetToken,
  };

  for (const [modelName, replacements] of Object.entries(overrides)) {
    if (modelName === "transaction") continue;
    for (const [key, replacement] of Object.entries(replacements)) {
      models[modelName][key] = replacement;
    }
  }

  if (overrides.transaction) {
    mongoose.connection.transaction = overrides.transaction;
  }

  try {
    await callback();
  } finally {
    for (const [model, key, original] of originals) {
      model[key] = original;
    }
    mongoose.connection.transaction = originalTransaction;
  }
};

const makeUserQuery = (user) => ({
  select: async () => user,
});

test("password reset request schema normalizes email and rejects invalid input", () => {
  assert.equal(
    passwordResetRequestSchema.parse({ email: " ADMIN@example.com " }).email,
    "admin@example.com"
  );
  assert.throws(() =>
    passwordResetRequestSchema.parse({
      email: "admin@example.com",
      role: "admin",
    })
  );
});

test("reset and change password validation enforce password rules and confirmation", () => {
  assert.throws(() =>
    passwordResetSchema.parse({
      token: "a".repeat(43),
      password: "weak",
      confirmPassword: "weak",
    })
  );
  assert.throws(() =>
    passwordResetSchema.parse({
      token: "a".repeat(43),
      password: "StrongPass1",
      confirmPassword: "OtherPass1",
    })
  );
  assert.throws(() =>
    changePasswordSchema.parse({
      currentPassword: "CurrentPass1",
      password: "StrongPass1",
      confirmPassword: "OtherPass1",
    })
  );
});

test("forgot password returns the same response for existing and unknown emails", async () => {
  const emailSender = async () => {};
  const existingUser = { _id: "admin-id", fullName: "Admin" };
  const responses = [];
  let attemptCount = 0;
  const savedTokens = [];

  await withModelStubs(
    {
      [PasswordResetAttempt.modelName]: {
        findOneAndUpdate: async () => ({ count: ++attemptCount }),
      },
      [User.modelName]: {
        findOne: (filter) =>
          makeUserQuery(
            filter.email === "admin@example.com" ? existingUser : null
          ),
        updateOne: async () => ({ matchedCount: 1 }),
      },
      [PasswordResetToken.modelName]: {
        deleteMany: async () => ({}),
        create: async ([record]) => savedTokens.push(record),
      },
      transaction: async (callback) => callback({}),
    },
    async () => {
      responses.push(
        await requestAdminPasswordReset({
          email: "admin@example.com",
          sendEmail: emailSender,
        })
      );
      responses.push(
        await requestAdminPasswordReset({
          email: "unknown@example.com",
          sendEmail: emailSender,
        })
      );

      assert.equal(savedTokens.length, 1);
      assert.equal(savedTokens[0].user, "admin-id");
      assert.equal(savedTokens[0].tokenHash.length, 64);
      assert.equal(savedTokens[0].expiresAt.getTime() - Date.now() <= 15 * 60 * 1000, true);
    }
  );

  assert.deepEqual(responses[0], responses[1]);
});

test("forgot password reports a generic service failure when email is not configured", async () => {
  let accountLookupCalled = false;
  await withModelStubs(
    {
      [User.modelName]: {
        findOne: () => {
          accountLookupCalled = true;
          return makeUserQuery(null);
        },
      },
    },
    async () => {
      await assert.rejects(
        () =>
          requestAdminPasswordReset({
            email: "admin@example.com",
            sendEmail: null,
          }),
        (error) =>
          error.statusCode === 503 &&
          error.message ===
            "Password reset email service is temporarily unavailable."
      );
    }
  );
  assert.equal(accountLookupCalled, false);
});

test("new password reset requests invalidate the previous token and delivery failure stays generic", async () => {
  let deleteCount = 0;
  const createdRecords = [];
  const emailCalls = [];
  await withModelStubs(
    {
      [PasswordResetAttempt.modelName]: {
        findOneAndUpdate: async () => ({ count: 1 }),
      },
      [User.modelName]: {
        findOne: () => makeUserQuery({ _id: "admin-id", fullName: "Admin" }),
        updateOne: async () => ({ matchedCount: 1 }),
      },
      [PasswordResetToken.modelName]: {
        deleteMany: async () => {
          deleteCount += 1;
        },
        create: async ([record]) => createdRecords.push(record),
        deleteOne: async () => {
          deleteCount += 1;
        },
      },
      transaction: async (callback) => callback({}),
    },
    async () => {
      const result = await requestAdminPasswordReset({
        email: "admin@example.com",
        sendEmail: async (payload) => {
          emailCalls.push(payload);
          throw Object.assign(new Error("private SMTP detail"), {
            code: "ECONNECTION",
          });
        },
      });

      assert.match(result.message, /If an account exists/);
    }
  );

  assert.equal(createdRecords.length, 1);
  assert.equal(deleteCount, 2);
  assert.equal(emailCalls[0].token.length, 43);
  assert.equal(createdRecords[0].tokenHash, hash(emailCalls[0].token));
  assert.equal(JSON.stringify(createdRecords[0]).includes(emailCalls[0].token), false);
});

test("password recovery requests work for Standard and Full Access admins", async () => {
  for (const permissions of [[], ["manageAdmins"]]) {
    let emailSent = false;
    await withModelStubs(
      {
        [PasswordResetAttempt.modelName]: {
          findOneAndUpdate: async () => ({ count: 1 }),
        },
        [User.modelName]: {
          findOne: () =>
            makeUserQuery({
              _id: `admin-${permissions.length}`,
              fullName: "Saheli Admin",
              role: "admin",
              status: "active",
              permissions,
            }),
          updateOne: async () => ({ matchedCount: 1 }),
        },
        [PasswordResetToken.modelName]: {
          deleteMany: async () => ({}),
          create: async () => ({}),
        },
        transaction: async (callback) => callback({}),
      },
      async () => {
        const result = await requestAdminPasswordReset({
          email: "admin@example.com",
          sendEmail: async () => {
            emailSent = true;
          },
        });

        assert.match(result.message, /If an account exists/);
      }
    );

    assert.equal(emailSent, true);
  }
});

test("password reset request limiting applies to the normalized account", async () => {
  let count = 0;
  let emailSent = 0;
  await withModelStubs(
    {
      [PasswordResetAttempt.modelName]: {
        findOneAndUpdate: async (filter) => {
          assert.doesNotMatch(filter._id, /admin@example\.com/i);
          return { count: ++count };
        },
      },
      [User.modelName]: {
        findOne: () =>
          makeUserQuery({ _id: "admin-id", fullName: "Saheli Admin" }),
        updateOne: async () => ({ matchedCount: 1 }),
      },
      [PasswordResetToken.modelName]: {
        deleteMany: async () => ({}),
        create: async () => ({}),
      },
      transaction: async (callback) => callback({}),
    },
    async () => {
      const responses = [];
      for (let request = 0; request < 4; request += 1) {
        responses.push(
          await requestAdminPasswordReset({
            email: "admin@example.com",
            sendEmail: async () => {
              emailSent += 1;
            },
          })
        );
      }

      assert.equal(
        responses.every((response) => response.message === responses[0].message),
        true
      );
    }
  );

  assert.equal(emailSent, 3);
});

test("reset token is one-time, updates only the password and revokes old sessions", async () => {
  const token = "a".repeat(43);
  const originalPasswordHash = await bcrypt.hash("PreviousPass1", 4);
  let currentPasswordHash = originalPasswordHash;
  let update;
  let updateFilter;
  let tokenAvailable = true;
  let tokenDeletes = 0;
  const userId = "507f1f77bcf86cd799439011";

  await withModelStubs(
    {
      [PasswordResetToken.modelName]: {
        findOne: (filter) => ({
          session: async () =>
            tokenAvailable && filter.tokenHash === hash(token)
              ? { user: userId }
              : null,
        }),
        deleteMany: async () => {
          tokenAvailable = false;
          tokenDeletes += 1;
        },
      },
      [User.modelName]: {
        updateOne: async (filter, updateData) => {
          updateFilter = filter;
          update = updateData;
          currentPasswordHash = updateData.$set.passwordHash;
          return { matchedCount: 1 };
        },
      },
      transaction: async (callback) => callback({}),
    },
    async () => {
      await resetAdminPassword({ token, password: "BrandNewPass2" });
      assert.equal(await bcrypt.compare("BrandNewPass2", currentPasswordHash), true);
      assert.equal(await bcrypt.compare("PreviousPass1", currentPasswordHash), false);
      assert.equal(update.$inc.authVersion, 1);
      assert.deepEqual(Object.keys(update.$set), ["passwordHash"]);
      assert.equal(updateFilter.role, "admin");
      assert.equal(updateFilter.status, "active");
      assert.equal(tokenDeletes, 1);
      await assert.rejects(
        () => resetAdminPassword({ token, password: "AnotherPass3" }),
        /invalid or has expired/i
      );
    }
  );
});

test("expired and invalid reset tokens are rejected without changing a password", async () => {
  await withModelStubs(
    {
      [PasswordResetToken.modelName]: {
        findOne: () => ({ session: async () => null }),
      },
      transaction: async (callback) => callback({}),
    },
    async () => {
      await assert.rejects(
        () =>
          resetAdminPassword({
            token: "b".repeat(43),
            password: "StrongPass1",
          }),
        /invalid or has expired/i
      );
    }
  );
});

test("admin password recovery preserves standard and full access permissions", async () => {
  for (const permissions of [[], ["manageAdmins"]]) {
    const user = {
      _id: "507f1f77bcf86cd799439012",
      passwordHash: await bcrypt.hash("OldPassword1", 4),
      permissions,
    };
    let update;
    await withModelStubs(
      {
        [User.modelName]: {
          findOne: () => makeUserQuery(user),
          updateOne: async (_filter, updateData) => {
            update = updateData;
            return { matchedCount: 1 };
          },
        },
        [PasswordResetToken.modelName]: {
          deleteMany: async () => ({}),
        },
        transaction: async (callback) => callback({}),
      },
      async () => {
        await changeAdminPassword({
          userId: user._id,
          currentPassword: "OldPassword1",
          password: "NewPassword2",
        });
      }
    );

    assert.deepEqual(user.permissions, permissions);
    assert.deepEqual(Object.keys(update.$set), ["passwordHash"]);
    assert.equal(update.$inc.authVersion, 1);
  }
});

test("wrong current password does not update the account", async () => {
  let updateCalled = false;
  const passwordHash = await bcrypt.hash("CurrentPass1", 4);
  await withModelStubs(
    {
      [User.modelName]: {
        findOne: () =>
          makeUserQuery({
            _id: "507f1f77bcf86cd799439013",
            passwordHash,
          }),
        updateOne: async () => {
          updateCalled = true;
        },
      },
    },
    async () => {
      await assert.rejects(
        () =>
          changeAdminPassword({
            userId: "507f1f77bcf86cd799439013",
            currentPassword: "WrongPass1",
            password: "NewPassword2",
          }),
        /current password is incorrect/i
      );
    }
  );
  assert.equal(updateCalled, false);
});

test("middleware rejects access tokens issued before a password change", async () => {
  const previousSecret = process.env.JWT_ACCESS_SECRET;
  process.env.JWT_ACCESS_SECRET = "test-secret-that-is-long-enough-for-access-token";
  const token = jwt.sign(
    {
      tokenType: "access",
      role: "admin",
      authVersion: 1,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      algorithm: "HS256",
      subject: "507f1f77bcf86cd799439014",
      issuer: "saheli-safar-api",
      audience: "saheli-safar-apps",
      expiresIn: "5m",
    }
  );
  const originalFindById = User.findById;
  let responseStatus;
  let responseBody;

  User.findById = () => ({
    select: async () => ({
      _id: "507f1f77bcf86cd799439014",
      role: "admin",
      status: "active",
      authVersion: 2,
    }),
  });

  try {
    await new Promise((resolve, reject) => {
      requireAuth("admin")(
        {
          get: () => `Bearer ${token}`,
        },
        {
          status(code) {
            responseStatus = code;
            return this;
          },
          json(body) {
            responseBody = body;
            resolve();
          },
        },
        reject
      );
    });
  } finally {
    User.findById = originalFindById;
    if (previousSecret === undefined) {
      delete process.env.JWT_ACCESS_SECRET;
    } else {
      process.env.JWT_ACCESS_SECRET = previousSecret;
    }
  }

  assert.equal(responseStatus, 401);
  assert.match(responseBody.message, /session has expired/i);
});
