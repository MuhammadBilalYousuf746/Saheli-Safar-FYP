
import mongoose from "mongoose";

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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const PassengerProfile = mongoose.model(
  "PassengerProfile",
  passengerProfileSchema
);

export default PassengerProfile;
