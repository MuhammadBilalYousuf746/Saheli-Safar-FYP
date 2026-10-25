
import mongoose from "mongoose";

import { APP_ROLES } from "../../utils/constants.js";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    purpose: {
      type: String,
      required: true,
      enum: ["email_verification", "password_reset"],
    },

    otpHash: {
      type: String,
      required: true,
      select: false,
    },

    // Registration details entered before the email is verified.
    // The account is created from these after successful verification.
    registration: {
      type: new mongoose.Schema(
        {
          fullName: { type: String, required: true, trim: true },
          phone: { type: String, required: true, trim: true },
          role: { type: String, required: true, enum: APP_ROLES },
        },
        { _id: false }
      ),
      default: null,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    consumedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    // New collection: the old phone OTP collection had a
    // { phone, purpose } unique index that would conflict.
    collection: "email_otps",
  }
);

// Automatically delete expired OTP records.
// MongoDB TTL cleanup may take some time.
otpSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

// Prevent duplicate OTP records for the same email and purpose.
otpSchema.index(
  { email: 1, purpose: 1 },
  { unique: true }
);

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
