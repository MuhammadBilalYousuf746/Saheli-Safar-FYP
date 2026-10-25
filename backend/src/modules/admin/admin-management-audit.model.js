import mongoose from "mongoose";

const adminManagementAuditSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["email_change", "deactivation"],
      required: true,
      immutable: true,
    },
    result: {
      type: String,
      enum: ["pending", "success", "failed"],
      required: true,
      immutable: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    targetAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    previousEmail: {
      type: String,
      default: null,
      immutable: true,
    },
    newEmail: {
      type: String,
      default: null,
      immutable: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

adminManagementAuditSchema.index({ targetAdmin: 1, createdAt: -1 });

const AdminManagementAudit = mongoose.model(
  "AdminManagementAudit",
  adminManagementAuditSchema
);

export default AdminManagementAudit;
