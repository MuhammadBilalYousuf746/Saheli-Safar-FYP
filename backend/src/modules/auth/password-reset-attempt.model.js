import mongoose from "mongoose";

const passwordResetAttemptSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      required: true,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0,
    },
  },
  {
    versionKey: false,
  }
);

const PasswordResetAttempt = mongoose.model(
  "PasswordResetAttempt",
  passwordResetAttemptSchema
);

export default PasswordResetAttempt;
