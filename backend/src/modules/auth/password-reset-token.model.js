import mongoose from "mongoose";

const passwordResetTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

passwordResetTokenSchema.index({ user: 1, createdAt: -1 });

const PasswordResetToken = mongoose.model(
  "PasswordResetToken",
  passwordResetTokenSchema
);

export default PasswordResetToken;
