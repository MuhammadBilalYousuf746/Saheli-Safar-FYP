import mongoose from "mongoose";

const adminAccessAuditSchema = new mongoose.Schema(
  {
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
    previousAccessLevel: {
      type: String,
      enum: ["full", "standard"],
      required: true,
      immutable: true,
    },
    newAccessLevel: {
      type: String,
      enum: ["full", "standard"],
      required: true,
      immutable: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

adminAccessAuditSchema.index({ targetAdmin: 1, createdAt: -1 });

const AdminAccessAudit = mongoose.model(
  "AdminAccessAudit",
  adminAccessAuditSchema
);

export default AdminAccessAudit;
