
import mongoose from "mongoose";
import { verificationAssetSchema, VERIFICATION_STATUSES } from "../verification/verification.model.js";

const emergencyContactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  phone: { type: String, required: true, match: /^\+923[0-9]{9}$/ },
  relationship: { type: String, required: true, trim: true, minlength: 2, maxlength: 40 },
}, { _id: false });

// Passenger-specific data. Name, email, phone and password
// live on the shared User account.
const passengerProfileSchema = new mongoose.Schema(
  {
    // Reference to the shared User account.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      immutable: true,
    },
    // A nullable single subdocument enforces zero-or-one, never an array.
    emergencyContact: { type: emergencyContactSchema, default: null },
    verificationStatus: { type: String, enum: VERIFICATION_STATUSES, default: "not_submitted" },
    verificationRevision: { type: Number, min: 0, default: 0 },
    submissionId: { type: String, default: null },
    verificationAssets: { type: [verificationAssetSchema], default: [], select: false },
    submittedAt: { type: Date, default: null },
    rejectionReason: { type: String, maxlength: 500, default: null },
    reverificationReason: { type: String, maxlength: 500, default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    documentsDeletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

passengerProfileSchema.index({ verificationStatus: 1, submittedAt: 1 });

const PassengerProfile = mongoose.model(
  "PassengerProfile",
  passengerProfileSchema
);

export default PassengerProfile;
