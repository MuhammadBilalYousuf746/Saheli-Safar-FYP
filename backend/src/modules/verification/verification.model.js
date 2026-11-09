import mongoose from "mongoose";

export const VERIFICATION_STATUSES = ["not_submitted", "pending_review", "approved", "rejected"];
export const verificationAssetSchema = new mongoose.Schema({
  kind: { type: String, enum: ["cnic", "selfie"], required: true },
  publicId: { type: String, required: true },
  format: { type: String, enum: ["jpg"], default: "jpg" },
  deliveryType: { type: String, enum: ["authenticated"], default: "authenticated" },
  resourceType: { type: String, enum: ["image"], default: "image" },
}, { _id: false });

// Decision history contains no image content or media URLs.
const reviewSchema = new mongoose.Schema({
  passenger: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, immutable: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, immutable: true },
  submissionId: { type: String, required: true, immutable: true },
  revision: { type: Number, required: true, immutable: true },
  decision: { type: String, enum: ["approved", "rejected", "reverification_requested"], required: true, immutable: true },
  reason: { type: String, maxlength: 500, default: null, immutable: true },
  decidedAt: { type: Date, required: true, immutable: true },
}, { versionKey: false, collection: "verificationreviews" });
reviewSchema.index({ passenger: 1, revision: 1 }, { unique: true });

// Durable upload/deletion journal: created BEFORE any Cloudinary request.
// Enables reconciliation after process crashes, timeouts or ambiguous DB acks.
const operationSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  passenger: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assets: { type: [verificationAssetSchema], required: true },
  state: { type: String, enum: ["uploading", "committed", "uncertain", "cleanup_pending", "cleaned"], default: "uploading" },
}, { timestamps: true, versionKey: false, collection: "verificationoperations" });
operationSchema.index({ state: 1, updatedAt: 1 });
export const VerificationReview = mongoose.model("VerificationReview", reviewSchema);
export const VerificationOperation = mongoose.model("VerificationOperation", operationSchema);
