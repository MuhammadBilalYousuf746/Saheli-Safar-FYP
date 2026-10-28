import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { createError } from "../../utils/app-error.js";
import User from "./user.model.js";
import PasswordResetAttempt from "./password-reset-attempt.model.js";
import PasswordResetToken from "./password-reset-token.model.js";
import { hashPassword } from "./auth.service.js";

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;
const ACCOUNT_WINDOW_MS = 60 * 60 * 1000;
const ACCOUNT_REQUEST_LIMIT = 3;
const GENERIC_REQUEST_MESSAGE =
  "If an account exists with this email address, you'll receive a password reset link shortly.";

const hashValue = (value) =>
  createHash("sha256").update(value).digest("hex");

const consumeAccountRequest = async (email, now) => {
  const bucket = Math.floor(now.getTime() / ACCOUNT_WINDOW_MS);
  const key = `${hashValue(email)}:${bucket}`;
  const expiresAt = new Date((bucket + 2) * ACCOUNT_WINDOW_MS);
  const attempt = await PasswordResetAttempt.findOneAndUpdate(
    { _id: key },
    {
      $inc: { count: 1 },
      $setOnInsert: { expiresAt },
    },
    { upsert: true, returnDocument: "after" }
  );

  return attempt.count <= ACCOUNT_REQUEST_LIMIT;
};

export const requestAdminPasswordReset = async ({
  email,
  sendEmail,
  now = new Date(),
}) => {
  if (typeof sendEmail !== "function") {
    throw createError(
      "Password reset email service is temporarily unavailable.",
      503
    );
  }

  if (!(await consumeAccountRequest(email, now))) {
    return { message: GENERIC_REQUEST_MESSAGE };
  }

  const user = await User.findOne({
    email,
    role: "admin",
    status: "active",
  }).select("_id fullName");

  if (!user) {
    return { message: GENERIC_REQUEST_MESSAGE };
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashValue(token);
  const expiresAt = new Date(now.getTime() + RESET_TOKEN_TTL_MS);
  let tokenCreated = false;

  await mongoose.connection.transaction(async (session) => {
    const updated = await User.updateOne(
      { _id: user._id, role: "admin", status: "active" },
      { $inc: { passwordResetVersion: 1 } },
      { session }
    );

    if (updated.matchedCount !== 1) {
      return;
    }

    await PasswordResetToken.deleteMany({ user: user._id }, { session });
    await PasswordResetToken.create(
      [{ user: user._id, tokenHash, expiresAt }],
      { session }
    );
    tokenCreated = true;
  });

  if (!tokenCreated) {
    return { message: GENERIC_REQUEST_MESSAGE };
  }

  try {
    await sendEmail({
      to: email,
      name: user.fullName || "",
      token,
      expiresInMinutes: 15,
    });
  } catch (error) {
    try {
      await PasswordResetToken.deleteOne({ tokenHash });
    } catch (cleanupError) {
      console.error("Unable to invalidate an undelivered password reset link.", {
        code:
          typeof cleanupError?.code === "string"
            ? cleanupError.code
            : "unknown",
      });
    }
    console.error("Password reset email delivery failed.", {
      code: typeof error?.code === "string" ? error.code : "unknown",
    });
  }

  return { message: GENERIC_REQUEST_MESSAGE };
};

const invalidResetTokenError = () =>
  createError("This password reset link is invalid or has expired.", 400);

export const resetAdminPassword = async ({ token, password }) => {
  const tokenHash = hashValue(token);
  const passwordHash = await hashPassword(password);

  await mongoose.connection.transaction(async (session) => {
    const resetRecord = await PasswordResetToken.findOne({
      tokenHash,
      expiresAt: { $gt: new Date() },
    }).session(session);

    if (!resetRecord) {
      throw invalidResetTokenError();
    }

    const updated = await User.updateOne(
      {
        _id: resetRecord.user,
        role: "admin",
        status: "active",
      },
      {
        $set: { passwordHash },
        $inc: { authVersion: 1 },
      },
      { session, runValidators: true }
    );

    if (updated.matchedCount !== 1) {
      throw invalidResetTokenError();
    }

    await PasswordResetToken.deleteMany(
      { user: resetRecord.user },
      { session }
    );
  });

  return { message: "Your password has been reset successfully." };
};

export const changeAdminPassword = async ({
  userId,
  currentPassword,
  password,
}) => {
  const user = await User.findOne({
    _id: userId,
    role: "admin",
    status: "active",
  }).select("+passwordHash");

  if (!user?.passwordHash) {
    throw createError("Admin account not found.", 404);
  }

  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw createError("Current password is incorrect.", 400);
  }

  const passwordHash = await hashPassword(password);

  await mongoose.connection.transaction(async (session) => {
    const updated = await User.updateOne(
      {
        _id: user._id,
        role: "admin",
        status: "active",
        passwordHash: user.passwordHash,
      },
      {
        $set: { passwordHash },
        $inc: { authVersion: 1 },
      },
      { session, runValidators: true }
    );

    if (updated.matchedCount !== 1) {
      throw createError(
        "Your password changed in another session. Please sign in again.",
        409
      );
    }

    await PasswordResetToken.deleteMany({ user: user._id }, { session });
  });

  return { message: "Your password has been changed successfully." };
};
