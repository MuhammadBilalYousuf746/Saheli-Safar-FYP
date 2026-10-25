import mongoose from "mongoose";

const adminEmailChangeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    previousEmail: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
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

const AdminEmailChange = mongoose.model(
  "AdminEmailChange",
  adminEmailChangeSchema
);

export default AdminEmailChange;
