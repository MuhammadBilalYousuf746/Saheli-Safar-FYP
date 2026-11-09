import mongoose from "mongoose";

// Shared event, with independent read state for each authorized administrator.
const schema = new mongoose.Schema({
  _id: { type: String },
  type: { type: String, enum: ["passenger_identity", "driver_verification"], required: true },
  entity: { type: mongoose.Schema.Types.ObjectId, required: true },
  resubmission: { type: Boolean, default: false },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true, versionKey: false });
schema.index({ type: 1, createdAt: -1, _id: -1 });
export default mongoose.model("AdminNotification", schema);
