
import mongoose from "mongoose";

// Admin-specific data. Name, email and password live on the shared User.
const adminProfileSchema = new mongoose.Schema(
  {
    // Reference to the shared User account.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      immutable: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const AdminProfile = mongoose.model(
  "AdminProfile",
  adminProfileSchema
);

export default AdminProfile;
