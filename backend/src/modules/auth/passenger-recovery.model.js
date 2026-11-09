import mongoose from "mongoose";

// One current challenge/grant per Passenger. Registration and Admin reset storage
// are intentionally separate; TTL cleanup never substitutes for expiry checks.
const schema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  email: { type: String, required: true, unique: true },
  challenge: { type: String, required: true },
  version: { type: Number, required: true },
  authVersion: { type: Number, required: true },
  otpHash: { type: String, select: false, default: null },
  attempts: { type: Number, default: 0 },
  sentAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true, expires: 0 },
  resetHash: { type: String, select: false, default: null },
}, { versionKey: false, collection: "passenger_recoveries" });

export default mongoose.model("PassengerRecovery", schema);
