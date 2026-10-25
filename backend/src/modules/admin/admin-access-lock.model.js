import mongoose from "mongoose";

const adminAccessLockSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    revision: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
  }
);

const AdminAccessLock = mongoose.model(
  "AdminAccessLock",
  adminAccessLockSchema
);

export default AdminAccessLock;
