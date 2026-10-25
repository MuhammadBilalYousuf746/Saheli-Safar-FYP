
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";

import User from "../auth/user.model.js";
import DriverProfile from "../driver/driver.model.js";
import { createError } from "../../utils/app-error.js";
import { APP_ROLES } from "../../utils/constants.js";

import {
  hashPassword,
  loginWithEmail,
  toAuthUser,
} from "../auth/auth.service.js";
import { toDriverProfile } from "../driver/driver.service.js";

import AdminProfile from "./admin.model.js";
import AdminAccessAudit from "./admin-access-audit.model.js";
import AdminAccessLock from "./admin-access-lock.model.js";
import AdminEmailChange from "./admin-email-change.model.js";
import AdminManagementAudit from "./admin-management-audit.model.js";

const USER_LIST_FIELDS =
  "fullName phone email role status isEmailVerified lastLoginAt createdAt";
const ADMIN_ACCESS_LOCK_ID = "admin-access-level-management";
const EMAIL_CHANGE_TTL_MS = 30 * 60 * 1000;

const initializeAdminAccessLock = () =>
  AdminAccessLock.updateOne(
    { _id: ADMIN_ACCESS_LOCK_ID },
    { $setOnInsert: { revision: 0 } },
    { upsert: true, setDefaultsOnInsert: true }
  );

const acquireAdminAccessLock = (session) =>
  AdminAccessLock.findOneAndUpdate(
    { _id: ADMIN_ACCESS_LOCK_ID },
    { $inc: { revision: 1 } },
    { new: true, session }
  );

const assertAdminManager = async (adminId, session) => {
  const actor = await User.findById(adminId)
    .select("_id role status permissions")
    .session(session);

  if (
    !actor ||
    actor.role !== "admin" ||
    actor.status !== "active" ||
    !hasAdminManagementAccess(actor)
  ) {
    throw createError(
      "You do not have permission to manage admin accounts.",
      403
    );
  }

  return actor;
};

const hashEmailChangeToken = (token) =>
  createHash("sha256").update(token).digest("hex");

const verifyRecentPassword = async (userId, password, session) => {
  const actor = await User.findById(userId)
    .select("+passwordHash")
    .session(session);

  if (
    !actor ||
    actor.role !== "admin" ||
    actor.status !== "active" ||
    typeof actor.passwordHash !== "string" ||
    !(await bcrypt.compare(password, actor.passwordHash))
  ) {
    throw createError("Password confirmation failed.", 401);
  }

  return actor;
};

const recordManagementFailure = async (audit) => {
  try {
    await AdminManagementAudit.create([{ ...audit, result: "failed" }]);
  } catch (error) {
    console.error("Admin management failure could not be audited.", {
      code: typeof error?.code === "string" ? error.code : "unknown",
    });
  }
};

const toPagination = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

const toAdminUser = (user) => ({
  id: user._id.toString(),
  fullName: user.fullName || null,
  phone: user.phone || null,
  email: user.email || null,
  role: user.role,
  status: user.status,
  isEmailVerified: user.isEmailVerified,
  permissions: Array.isArray(user.permissions) ? user.permissions : [],
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
});

const toManagedAdmin = (user, pendingEmail = null) => ({
  ...toAdminUser(user),
  accessLevel: hasAdminManagementAccess(user) ? "full" : "standard",
  pendingEmail,
});

const hasAdminManagementAccess = (user) =>
  Array.isArray(user.permissions) &&
  user.permissions.includes("manageAdmins");

const getPermissionsForAccessLevel = (permissions, accessLevel) => {
  const preserved = (Array.isArray(permissions) ? permissions : []).filter(
    (permission) => permission !== "manageAdmins"
  );

  return accessLevel === "full"
    ? [...preserved, "manageAdmins"]
    : preserved;
};

const toAdminDriver = (profile) => ({
  ...(profile.user ? toAdminUser(profile.user) : {}),
  ...toDriverProfile(profile),
  submittedAt: profile.createdAt,
});

// ==========================================
// ADMIN ACCOUNT
// ==========================================

// One-time server-side bootstrap; refuses to run after any admin exists.
export const provisionFirstAdmin = async ({ fullName, email, password }) => {
  const passwordHash = await hashPassword(password);
  await initializeAdminAccessLock();

  return mongoose.connection.transaction(async (session) => {
    await acquireAdminAccessLock(session);
    const existingAdminCount = await User.countDocuments({
      role: "admin",
    }).session(session);

    if (existingAdminCount > 0) {
      throw createError(
        "Admin bootstrap is disabled because an admin account already exists.",
        409
      );
    }

    const [user] = await User.create(
      [
        {
          fullName,
          email,
          passwordHash,
          role: "admin",
          status: "active",
          isEmailVerified: true,
          permissions: ["manageAdmins"],
        },
      ],
      { session }
    );

    await AdminProfile.create([{ user: user._id }], { session });

    return toAuthUser(user);
  });
};

// Admin login using email and password.
export const loginAdmin = ({ email, password }) =>
  loginWithEmail({ email, password, role: "admin" });

// GET current admin account and profile.
export const getAdminProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw createError("Admin not found.", 404);
  }

  const pendingEmailChange = await AdminEmailChange.findOne({
    user: user._id,
    expiresAt: { $gt: new Date() },
  }).select("email");

  return {
    ...toAuthUser(user),
    lastLoginAt: user.lastLoginAt,
    pendingEmail: pendingEmailChange?.email || null,
  };
};

// ==========================================
// ADMIN MANAGEMENT
// ==========================================

export const listAdmins = async ({ page, limit }) => {
  const [admins, total] = await Promise.all([
    User.find({ role: "admin" })
      .select(
        "fullName email role status isEmailVerified permissions lastLoginAt createdAt"
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments({ role: "admin" }),
  ]);
  const pendingEmailChanges = admins.length
    ? await AdminEmailChange.find({
        user: { $in: admins.map((admin) => admin._id) },
        expiresAt: { $gt: new Date() },
      }).select("user email")
    : [];
  const pendingEmailByUser = new Map(
    pendingEmailChanges.map((change) => [
      change.user.toString(),
      change.email,
    ])
  );

  return {
    admins: admins.map((admin) =>
      toManagedAdmin(admin, pendingEmailByUser.get(admin._id.toString()))
    ),
    pagination: toPagination({ page, limit, total }),
  };
};

export const createAdminAccount = async ({
  fullName,
  email,
  password,
  accessLevel = "standard",
  createdBy,
}) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!normalizedEmail) {
    throw createError("Email address is required.", 400);
  }

  const existing = await User.findOne({ email: normalizedEmail }).select(
    "_id role"
  );

  if (existing) {
    throw createError(
      `An account with ${normalizedEmail} already exists (role: ${existing.role}).`,
      409
    );
  }

  const passwordHash = await hashPassword(password);

  let userRecord;

  try {
    await initializeAdminAccessLock();
    userRecord = await mongoose.connection.transaction(
      async (session) => {
        await acquireAdminAccessLock(session);
        await assertAdminManager(createdBy, session);

        await AdminEmailChange.deleteMany(
          { expiresAt: { $lte: new Date() } },
          { session }
        );
        const reservedEmail = await AdminEmailChange.findOne({
          email: normalizedEmail,
        }).session(session);

        if (reservedEmail) {
          throw createError(
            "This email address is reserved for a pending admin email change.",
            409
          );
        }

        const [user] = await User.create(
          [
            {
              fullName,
              email: normalizedEmail,
              passwordHash,
              role: "admin",
              status: "active",
              isEmailVerified: true,
              permissions: getPermissionsForAccessLevel([], accessLevel),
            },
          ],
          { session }
        );

        await AdminProfile.create([{ user: user._id }], { session });

        return user;
      }
    );
  } catch (error) {
    if (
      error.code === 11000 &&
      (error.keyPattern?.email || error.keyValue?.email)
    ) {
      throw createError(
        `An account with ${normalizedEmail} already exists.`,
        409
      );
    }

    throw error;
  }

  return toAuthUser(userRecord);
};

export const updateAdminAccess = async ({
  userId,
  accessLevel,
  changedBy,
}) => {
  await initializeAdminAccessLock();

  return mongoose.connection.transaction(async (session) => {
    // A shared lock serializes access-level changes so simultaneous
    // demotions cannot remove the last Full Access admin.
    await acquireAdminAccessLock(session);
    await assertAdminManager(changedBy, session);

    const target = await User.findOne({
      _id: userId,
      role: "admin",
    })
      .select("_id fullName email role status permissions createdAt")
      .session(session);

    if (!target) {
      throw createError("Admin account not found.", 404);
    }

    const previousAccessLevel = hasAdminManagementAccess(target)
      ? "full"
      : "standard";

    if (
      target._id.toString() === changedBy &&
      previousAccessLevel === "full" &&
      accessLevel === "standard"
    ) {
      throw createError(
        "You cannot remove your own Full Access permission.",
        403
      );
    }

    if (previousAccessLevel === accessLevel) {
      return toManagedAdmin(target);
    }

    if (previousAccessLevel === "full" && accessLevel === "standard") {
      const otherFullAccessAdmins = await User.countDocuments({
        role: "admin",
        status: "active",
        permissions: "manageAdmins",
        _id: { $ne: target._id },
      }).session(session);

      if (otherFullAccessAdmins === 0) {
        throw createError(
          "The last Full Access admin cannot be downgraded.",
          409
        );
      }
    }

    await User.updateOne(
      { _id: target._id, role: "admin" },
      {
        $set: {
          permissions: getPermissionsForAccessLevel(
            target.permissions,
            accessLevel
          ),
        },
      },
      { runValidators: true, session }
    );

    await AdminAccessAudit.create(
      [
        {
          changedBy,
          targetAdmin: target._id,
          previousAccessLevel,
          newAccessLevel: accessLevel,
        },
      ],
      { session }
    );

    const updatedAdmin = await User.findById(target._id)
      .select(
        "fullName email role status isEmailVerified permissions lastLoginAt createdAt"
      )
      .session(session);

    return toManagedAdmin(updatedAdmin);
  });
};

export const requestAdminEmailChange = async ({
  userId,
  email,
  password,
  changedBy,
  sendEmail,
  notifyPreviousEmail,
}) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashEmailChangeToken(token);
  const auditBase = {
    action: "email_change",
    changedBy,
    targetAdmin: userId,
    newEmail: normalizedEmail,
  };
  let previousEmail;
  let failureAuditRecorded = false;

  try {
    if (typeof sendEmail !== "function") {
      throw createError(
        "Admin email verification is not configured. Contact an operator.",
        503
      );
    }

    await initializeAdminAccessLock();
    const pendingChange = await mongoose.connection.transaction(
      async (session) => {
        await acquireAdminAccessLock(session);
        const isSelfChange = userId === changedBy;

        if (!isSelfChange) {
          await assertAdminManager(changedBy, session);
        }
        const actor = await verifyRecentPassword(changedBy, password, session);

        const target = await User.findOne({
          _id: userId,
          role: "admin",
          status: "active",
        })
          .select("_id fullName email isEmailVerified")
          .session(session);

        if (!target) {
          throw createError("Active admin account not found.", 404);
        }

        if (target.email === normalizedEmail) {
          throw createError("The new email matches the current email.", 409);
        }

        await AdminEmailChange.deleteMany(
          { expiresAt: { $lte: new Date() } },
          { session }
        );
        const existingAccount = await User.findOne({
          email: normalizedEmail,
          _id: { $ne: target._id },
        })
          .select("_id")
          .session(session);

        if (existingAccount) {
          throw createError("This email address is already in use.", 409);
        }

        const existingReservation = await AdminEmailChange.findOne({
          email: normalizedEmail,
        }).session(session);

        if (
          existingReservation &&
          existingReservation.user.toString() !== target._id.toString()
        ) {
          throw createError(
            "This email address is reserved for another pending change.",
            409
          );
        }

        await AdminEmailChange.deleteMany(
          { user: target._id },
          { session }
        );
        const [createdChange] = await AdminEmailChange.create(
          [
            {
              user: target._id,
              changedBy: actor._id,
              previousEmail: target.email,
              email: normalizedEmail,
              tokenHash,
              expiresAt: new Date(Date.now() + EMAIL_CHANGE_TTL_MS),
            },
          ],
          { session }
        );
        await AdminManagementAudit.create(
          [{ ...auditBase, previousEmail: target.email, result: "pending" }],
          { session }
        );

        return {
          changeId: createdChange._id,
          targetName: target.fullName,
          previousEmail: target.email,
          previousEmailVerified: target.isEmailVerified === true,
        };
      }
    );
    previousEmail = pendingChange.previousEmail;

    try {
      await sendEmail({
        to: normalizedEmail,
        name: pendingChange.targetName || "",
        token,
        expiresInMinutes: 30,
      });
    } catch (error) {
      try {
        await AdminEmailChange.deleteOne({ _id: pendingChange.changeId });
      } catch (cleanupError) {
        console.error("Undelivered admin email verification could not be cleared.", {
          code:
            typeof cleanupError?.code === "string"
              ? cleanupError.code
              : "unknown",
        });
      }
      await recordManagementFailure({
        ...auditBase,
        previousEmail: pendingChange.previousEmail,
      });
      failureAuditRecorded = true;
      console.error("Admin email verification delivery failed.", {
        code: typeof error?.code === "string" ? error.code : "unknown",
      });
      throw createError(
        "Verification email could not be sent. The email was not changed.",
        503
      );
    }

    if (
      pendingChange.previousEmailVerified &&
      typeof notifyPreviousEmail === "function"
    ) {
      try {
        await notifyPreviousEmail({
          to: pendingChange.previousEmail,
          name: pendingChange.targetName || "",
          newEmail: normalizedEmail,
        });
      } catch (error) {
        console.error("Admin email change notice delivery failed.", {
          code: typeof error?.code === "string" ? error.code : "unknown",
        });
      }
    }

    return {
      message: "A verification link was sent to the new email address.",
    };
  } catch (error) {
    if (error.code === 11000) {
      if (!failureAuditRecorded) {
        await recordManagementFailure({ ...auditBase, previousEmail });
      }
      throw createError("This email address is already in use or reserved.", 409);
    }

    if (!failureAuditRecorded) {
      await recordManagementFailure({ ...auditBase, previousEmail });
    }

    throw error;
  }
};

export const resendOwnAdminEmailVerification = async ({
  userId,
  sendEmail,
}) => {
  if (typeof sendEmail !== "function") {
    throw createError(
      "Admin email verification is not configured. Contact an operator.",
      503
    );
  }

  const user = await User.findOne({
    _id: userId,
    role: "admin",
    status: "active",
  }).select("fullName");

  if (!user) {
    throw createError("Active admin account not found.", 404);
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashEmailChangeToken(token);
  const change = await AdminEmailChange.findOneAndUpdate(
    {
      user: userId,
      expiresAt: { $gt: new Date() },
    },
    {
      $set: {
        tokenHash,
        expiresAt: new Date(Date.now() + EMAIL_CHANGE_TTL_MS),
      },
    },
    { returnDocument: "after" }
  );

  if (!change) {
    throw createError(
      "No pending email change was found. Request a new email change.",
      404
    );
  }

  try {
    await sendEmail({
      to: change.email,
      name: user.fullName || "",
      token,
      expiresInMinutes: 30,
    });
  } catch (error) {
    await AdminEmailChange.deleteOne({ _id: change._id });
    await recordManagementFailure({
      action: "email_change",
      changedBy: change.changedBy,
      targetAdmin: userId,
      previousEmail: change.previousEmail,
      newEmail: change.email,
    });
    console.error("Admin email verification resend failed.", {
      code: typeof error?.code === "string" ? error.code : "unknown",
    });
    throw createError(
      "Verification email could not be sent. Request a new email change.",
      503
    );
  }

  return { message: "A new verification link was sent to the pending address." };
};

export const verifyAdminEmailChange = async ({ token }) => {
  const tokenHash = hashEmailChangeToken(token);
  let attemptedChange;

  try {
    return await mongoose.connection.transaction(async (session) => {
      const change = await AdminEmailChange.findOne({
        tokenHash,
        expiresAt: { $gt: new Date() },
      }).session(session);

      if (!change) {
        throw createError(
          "This email verification link is invalid or has expired.",
          400
        );
      }
      attemptedChange = change;

      const updated = await User.updateOne(
        {
          _id: change.user,
          role: "admin",
          status: "active",
          email: change.previousEmail,
        },
        {
          $set: {
            email: change.email,
            isEmailVerified: true,
          },
          $inc: { authVersion: 1 },
        },
        { runValidators: true, session }
      );

      if (updated.matchedCount !== 1) {
        throw createError(
          "The admin account changed before email verification completed.",
          409
        );
      }

      await AdminEmailChange.deleteOne({ _id: change._id }, { session });
      await AdminManagementAudit.create(
        [
          {
            action: "email_change",
            result: "success",
            changedBy: change.changedBy,
            targetAdmin: change.user,
            previousEmail: change.previousEmail,
            newEmail: change.email,
          },
        ],
        { session }
      );

      return {
        message: "Admin email updated successfully. Sign in again to continue.",
      };
    });
  } catch (error) {
    if (attemptedChange) {
      if (error.code === 11000 || error.statusCode === 409) {
        try {
          await AdminEmailChange.deleteOne({ _id: attemptedChange._id });
        } catch (cleanupError) {
          console.error("Failed admin email verification could not be cleared.", {
            code:
              typeof cleanupError?.code === "string"
                ? cleanupError.code
                : "unknown",
          });
        }
      }
      await recordManagementFailure({
        action: "email_change",
        changedBy: attemptedChange.changedBy,
        targetAdmin: attemptedChange.user,
        previousEmail: attemptedChange.previousEmail,
        newEmail: attemptedChange.email,
      });
    }
    if (error.code === 11000) {
      throw createError("This email address is already in use.", 409);
    }
    throw error;
  }
};

export const deactivateAdminAccount = async ({
  userId,
  password,
  confirmation,
  changedBy,
}) => {
  const auditBase = {
    action: "deactivation",
    changedBy,
    targetAdmin: userId,
  };

  try {
    await initializeAdminAccessLock();
    return await mongoose.connection.transaction(async (session) => {
      await acquireAdminAccessLock(session);
      const isSelfDeactivation = userId === changedBy;
      if (!isSelfDeactivation) {
        await assertAdminManager(changedBy, session);
      }
      await verifyRecentPassword(changedBy, password, session);

      if (confirmation !== "DELETE") {
        throw createError("Type DELETE to confirm deactivation.", 400);
      }

      const target = await User.findOne({
        _id: userId,
        role: "admin",
        status: "active",
      })
        .select("_id email permissions")
        .session(session);

      if (!target) {
        throw createError("Active admin account not found.", 404);
      }

      if (hasAdminManagementAccess(target)) {
        const otherFullAccessAdmins = await User.countDocuments({
          role: "admin",
          status: "active",
          permissions: "manageAdmins",
          _id: { $ne: target._id },
        }).session(session);

        if (otherFullAccessAdmins === 0) {
          throw createError(
            "The last active Full Access admin cannot be deactivated.",
            409
          );
        }
      }

      const updated = await User.updateOne(
        { _id: target._id, role: "admin", status: "active" },
        {
          $set: {
            status: "deactivated",
            deactivatedAt: new Date(),
            deactivatedBy: changedBy,
          },
          $inc: { authVersion: 1 },
        },
        { runValidators: true, session }
      );

      if (updated.matchedCount !== 1) {
        throw createError(
          "Admin account changed before deactivation completed.",
          409
        );
      }

      await AdminEmailChange.deleteMany({ user: target._id }, { session });
      await AdminManagementAudit.create(
        [{ ...auditBase, result: "success", previousEmail: target.email }],
        { session }
      );

      return { message: "Admin account deactivated and access revoked." };
    });
  } catch (error) {
    await recordManagementFailure(auditBase);
    throw error;
  }
};

// ==========================================
// DRIVER VERIFICATION
// ==========================================

export const listDrivers = async ({
  verificationStatus,
  page,
  limit,
}) => {
  const filter = verificationStatus ? { verificationStatus } : {};

  const [profiles, total] = await Promise.all([
    DriverProfile.find(filter)
      .populate("user", USER_LIST_FIELDS)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    DriverProfile.countDocuments(filter),
  ]);

  return {
    drivers: profiles.map(toAdminDriver),
    pagination: toPagination({ page, limit, total }),
  };
};

export const getDriver = async (userId) => {
  const profile = await DriverProfile.findOne({
    user: userId,
  }).populate("user", USER_LIST_FIELDS);

  if (!profile) {
    throw createError("Driver not found.", 404);
  }

  return toAdminDriver(profile);
};

// Approve or reject a driver's submitted documents.
export const updateDriverVerification = async ({
  userId,
  status,
  reason,
  adminId,
}) => {
  const profile = await DriverProfile.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        verificationStatus: status,
        rejectionReason: status === "rejected" ? reason : null,
        verifiedBy: adminId,
        verifiedAt: new Date(),
      },
    },
    {
      returnDocument: "after",
      runValidators: true,
    }
  ).populate("user", USER_LIST_FIELDS);

  if (!profile) {
    throw createError("Driver not found.", 404);
  }

  return toAdminDriver(profile);
};

// ==========================================
// USER MANAGEMENT
// ==========================================

// List passenger and driver accounts. Admin accounts are never listed.
export const listUsers = async ({ role, status, page, limit }) => {
  const filter = {
    role: role || { $in: APP_ROLES },
    ...(status && { status }),
  };

  const [users, total] = await Promise.all([
    User.find(filter)
      .select(USER_LIST_FIELDS)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    users: users.map(toAdminUser),
    pagination: toPagination({ page, limit, total }),
  };
};

// Activate, suspend or disable a passenger or driver account.
// Accounts that have not finished registration cannot be changed.
export const updateUserStatus = async ({ userId, status }) => {
  const user = await User.findOneAndUpdate(
    {
      _id: userId,
      role: { $in: APP_ROLES },
      status: { $ne: "pending" },
    },
    { $set: { status } },
    {
      returnDocument: "after",
      runValidators: true,
    }
  ).select(USER_LIST_FIELDS);

  if (!user) {
    throw createError(
      "User not found or registration is incomplete.",
      404
    );
  }

  return toAdminUser(user);
};
