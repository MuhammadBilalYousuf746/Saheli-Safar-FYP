
import mongoose from "mongoose";

import { ROLES, USER_STATUSES } from "../../utils/constants.js";

const userSchema = new mongoose.Schema(
  {
    // Required for passengers and drivers (enforced at registration).
    fullName: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    // Passengers and drivers: required at registration.
    // Admins: not used.
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      match: /^\+923[0-9]{9}$/,
    },

    // Verified with email OTP during registration.

    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },

    passwordHash: {
      type: String,
      select: false,
    },

    authVersion: {
      type: Number,
      default: 0,
      min: 0,
    },

    deactivatedAt: {
      type: Date,
      default: null,
    },

    deactivatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    passwordResetVersion: {
      type: Number,
      default: 0,
      min: 0,
      select: false,
    },

    permissions: {
      type: [String],
      default: [],
    },

    role: {
      type: String,
      enum: ROLES,
      default: "passenger",
      required: true,
      immutable: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: USER_STATUSES,
      default: "pending",
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.index({ role: 1, status: 1 });

const User = mongoose.model("User", userSchema);

export default User;
