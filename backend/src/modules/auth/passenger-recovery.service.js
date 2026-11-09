import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import mongoose from "mongoose";
import User from "./user.model.js";
import Recovery from "./passenger-recovery.model.js";
import Attempts from "./password-reset-attempt.model.js";
import { generateOtp, hashOtp } from "./otp-crypto.js";
import { hashPassword } from "./auth.service.js";
import { emailSchema, verifyEmailOtpSchema, passwordResetSchema } from "./auth.validation.js";
import { createError } from "../../utils/app-error.js";

const TTL = 5 * 60 * 1000;
const PURPOSE = "passenger_password_reset";
const digest = value => createHash("sha256").update(value).digest("hex");
const invalid = () => createError("The code or reset authorization is invalid, expired or already used. Request a new code if needed.", 400);
const eligible = email => ({ email, role: "passenger", status: "active", isEmailVerified: true });
const publicResult = () => ({ message: process.env.EMAIL_PROVIDER === "console" && process.env.NODE_ENV === "development"
  ? "If this email belongs to an eligible Passenger, a development reset code will appear in the backend terminal. No email will be sent."
  : "If this email belongs to an eligible Passenger account, a reset code will arrive shortly. Check your inbox and spam folder.",
  expiresInSeconds: 300, retryAfterSeconds: 60 });

// Dependencies allow isolated tests without connecting to MongoDB or SMTP.
export function createPassengerRecoveryService({ users = User, records = Recovery, attempts = Attempts,
  transaction = run => mongoose.connection.transaction(run), hash = hashPassword,
  clock = () => new Date(), enqueue = task => setImmediate(() => { void task(); }),
  report = () => console.error("Passenger reset delivery is unavailable; no sensitive details were logged."),
} = {}) {
  const deliver = async (email, sendEmail, requestedAt) => {
    let issued;
    try {
      await transaction(async session => {
        issued = null; // Transactions can retry the callback.
        const user = await users.findOne(eligible(email)).select("_id fullName authVersion +passwordResetVersion").session(session);
        if (!user) return;
        const previous = await records.findById(user._id).select("+otpHash").session(session);
        const now = clock();
        if (previous && (previous.sentAt > requestedAt || now - previous.sentAt < 60000)) return;
        // Serialize issuance and final reset against the same User document.
        const updated = await users.findOneAndUpdate({ ...eligible(email), _id: user._id },
          { $inc: { passwordResetVersion: 1 } }, { session, returnDocument: "after" }).select("+passwordResetVersion");
        if (!updated) return;
        let otp = generateOtp();
        while (previous?.otpHash === hashOtp(email, PURPOSE, otp)) otp = generateOtp();
        const challenge = randomBytes(16).toString("hex");
        await records.findOneAndUpdate({ _id: user._id }, { $set: {
          email, challenge, version: updated.passwordResetVersion, authVersion: updated.authVersion || 0,
          otpHash: hashOtp(email, PURPOSE, otp), attempts: 0, sentAt: now,
          expiresAt: new Date(now.getTime() + TTL), resetHash: null,
        } }, { upsert: true, session, runValidators: true });
        issued = { user, otp, challenge };
      });
      if (issued) await sendEmail({ to: email, name: issued.user.fullName || "", otp: issued.otp,
        purpose: "password_reset", expiresInMinutes: 5 });
    } catch {
      if (issued) {
        try { await records.deleteOne({ _id: issued.user._id, challenge: issued.challenge }); }
        catch { /* The record still expires; never delete a newer challenge. */ }
      }
      report();
    }
  };

  const request = async ({ email, sendEmail }) => {
    email = emailSchema.parse(email);
    if (typeof sendEmail !== "function") throw createError("Password recovery is temporarily unavailable. Please try again later.", 503);
    const now = clock();
    const bucket = Math.floor(now.getTime() / 3600000);
    // Rate buckets apply to every submitted address, including unknown accounts.
    const attempt = await attempts.findOneAndUpdate({ _id: `passenger:${digest(email)}:${bucket}` },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((bucket + 2) * 3600000) } },
      { upsert: true, returnDocument: "after" });
    if (attempt.count <= 3) enqueue(() => deliver(email, sendEmail, now));
    // Do not await account lookup/SMTP: delivery latency/failure must not disclose
    // account eligibility through the public response or status code.
    return publicResult();
  };

  const verify = async input => {
    const { email, otp } = verifyEmailOtpSchema.parse(input);
    const record = await records.findOne({ email }).select("+otpHash");
    if (!record?.otpHash || record.expiresAt <= clock() || record.attempts >= 5) throw invalid();
    if (!await users.findOne({ ...eligible(email), _id: record._id,
      passwordResetVersion: record.version, authVersion: record.authVersion })) throw invalid();
    const supplied = hashOtp(email, PURPOSE, otp);
    if (!timingSafeEqual(Buffer.from(record.otpHash, "hex"), Buffer.from(supplied, "hex"))) {
      await records.updateOne({ _id: record._id, challenge: record.challenge, otpHash: record.otpHash, attempts: { $lt: 5 } }, { $inc: { attempts: 1 } });
      throw invalid();
    }
    const token = randomBytes(32).toString("base64url");
    const granted = await records.findOneAndUpdate({ _id: record._id, challenge: record.challenge,
      otpHash: record.otpHash, attempts: { $lt: 5 }, expiresAt: { $gt: clock() } },
    { $set: { otpHash: null, resetHash: digest(token), expiresAt: new Date(clock().getTime() + TTL) } }, { returnDocument: "after" });
    if (!granted) throw invalid();
    return { resetToken: token, expiresInSeconds: 300 };
  };

  const reset = async input => {
    const { token, password } = passwordResetSchema.parse(input);
    const tokenHash = digest(token);
    // Avoid expensive bcrypt for obviously invalid authorizations.
    if (!await records.findOne({ resetHash: tokenHash, expiresAt: { $gt: clock() } })) throw invalid();
    const passwordHash = await hash(password);
    await transaction(async session => {
      const record = await records.findOne({ resetHash: tokenHash, expiresAt: { $gt: clock() } }).session(session);
      if (!record) throw invalid();
      const updated = await users.updateOne({ ...eligible(record.email), _id: record._id,
        passwordResetVersion: record.version, authVersion: record.authVersion },
      { $set: { passwordHash }, $inc: { authVersion: 1, passwordResetVersion: 1 } }, { session, runValidators: true });
      if (updated.matchedCount !== 1) throw invalid();
      const removed = await records.deleteOne({ _id: record._id, challenge: record.challenge, resetHash: tokenHash }, { session });
      if (removed.deletedCount !== 1) throw invalid();
    });
    return { message: "Your password has been reset. Please sign in with your new password." };
  };
  return { request, verify, reset };
}

export const passengerRecovery = createPassengerRecoveryService();
