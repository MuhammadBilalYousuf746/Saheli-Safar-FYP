
import crypto from "node:crypto";
import OTP from "./otp.model.js";
import { isValidEmail } from "../../utils/constants.js";

const OTP_EXPIRY_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;

const OTP_EXPIRY_MS = OTP_EXPIRY_MINUTES * 60 * 1000;
const RESEND_COOLDOWN_MS = RESEND_COOLDOWN_SECONDS * 1000;

const VALID_PURPOSES = [
  "email_verification",
  "password_reset",
];

const validateInputs = (email, purpose) => {
  if (!isValidEmail(email)) {
    throw new Error("Invalid email address.");
  }

  if (!VALID_PURPOSES.includes(purpose)) {
    throw new Error("Invalid OTP purpose.");
  }
};

const hashOtp = (email, purpose, otp) => {
  const secret = process.env.OTP_HMAC_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("OTP_HMAC_SECRET is not configured.");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(`${purpose}:${email}:${otp}`)
    .digest("hex");
};

// Generate and email a secure OTP.
// `registration` ({ fullName, phone, role }) is stored with the OTP
// and returned after successful verification. When omitted (resend),
// the registration details already stored are kept.
export const sendEmailOtp = async ({
  email,
  purpose,
  sendEmail,
  name,
  registration,
}) => {
  validateInputs(email, purpose);

  if (typeof sendEmail !== "function") {
    throw new Error("Email delivery service is not configured.");
  }

  const now = new Date();

  const otp = crypto
    .randomInt(0, 1000000)
    .toString()
    .padStart(6, "0");

  const expiresAt = new Date(
    now.getTime() + OTP_EXPIRY_MS
  );

  const otpHash = hashOtp(email, purpose, otp);

  // OTP expires 5 minutes after creation.
  // This cutoff enforces a 60-second resend cooldown.
  const cooldownCutoff = new Date(
    now.getTime() + OTP_EXPIRY_MS - RESEND_COOLDOWN_MS
  );

  let otpRecord;

  try {
    // Atomic operation:
    // - Creates an OTP if no record exists.
    // - Replaces an old OTP after cooldown.
    // - Unique index blocks simultaneous duplicate inserts.
    otpRecord = await OTP.findOneAndUpdate(
      {
        email,
        purpose,
        expiresAt: { $lte: cooldownCutoff },
      },
      {
        $set: {
          otpHash,
          expiresAt,
          attempts: 0,
          consumedAt: null,
          ...(registration && { registration }),
        },
      },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
      }
    );
  } catch (error) {
    // Existing OTP is still within cooldown,
    // or another concurrent request won the race.
    if (error.code === 11000) {
      const cooldownError = new Error(
        "Please wait before requesting another OTP."
      );
      cooldownError.statusCode = 429;
      throw cooldownError;
    }

    throw error;
  }

  try {
    await sendEmail({
      to: email,
      name: name || otpRecord.registration?.fullName,
      otp,
      purpose,
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    });
  } catch (error) {
    console.error("❌ Email delivery failed:", error.message);

    // Remove only this OTP if delivery failed.
    await OTP.deleteOne({
      _id: otpRecord._id,
      otpHash,
    });

    const deliveryError = new Error(
      "Verification email could not be sent. Please try again."
    );
    deliveryError.statusCode = 502;
    throw deliveryError;
  }

  return {
    expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
  };
};

// Find the stored registration details for a pending email OTP.
export const findPendingRegistration = async ({ email, purpose }) => {
  validateInputs(email, purpose);

  const record = await OTP.findOne({
    email,
    purpose,
    consumedAt: null,
  }).select("registration");

  return record?.registration || null;
};

// Verify and consume OTP.
// Returns the consumed OTP record (including `registration`),
// or null when the code is wrong, expired, reused or locked.
export const verifyEmailOtp = async ({
  email,
  purpose,
  otp,
}) => {
  validateInputs(email, purpose);

  if (typeof otp !== "string" || !/^[0-9]{6}$/.test(otp)) {
    return null;
  }

  const record = await OTP.findOne({
    email,
    purpose,
  }).select("+otpHash");

  if (
    !record ||
    record.consumedAt ||
    record.expiresAt <= new Date() ||
    record.attempts >= MAX_ATTEMPTS
  ) {
    return null;
  }

  const suppliedHash = hashOtp(email, purpose, otp);

  const isValid = crypto.timingSafeEqual(
    Buffer.from(record.otpHash, "hex"),
    Buffer.from(suppliedHash, "hex")
  );

  if (!isValid) {
    await OTP.updateOne(
      {
        _id: record._id,
        consumedAt: null,
        attempts: { $lt: MAX_ATTEMPTS },
      },
      {
        $inc: { attempts: 1 },
      }
    );

    return null;
  }

  // Prevent OTP reuse with atomic consumption.
  return OTP.findOneAndUpdate(
    {
      _id: record._id,
      otpHash: suppliedHash,
      consumedAt: null,
      expiresAt: { $gt: new Date() },
      attempts: { $lt: MAX_ATTEMPTS },
    },
    {
      $set: { consumedAt: new Date() },
    },
    {
      returnDocument: "after",
    }
  );
};
