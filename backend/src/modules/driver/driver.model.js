
import mongoose from "mongoose";

import {
  DRIVER_VERIFICATION_STATUSES,
  VEHICLE_TYPES,
} from "../../utils/constants.js";

const vehicleSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: VEHICLE_TYPES,
    },

    make: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },

    model: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },

    color: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },

    year: {
      type: Number,
      required: true,
      min: 1980,
    },

    plateNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 15,
    },
  },
  { _id: false }
);

const driverProfileSchema = new mongoose.Schema(
  {
    // Reference to the shared User account.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      immutable: true,
    },

    // Pakistani CNIC: XXXXX-XXXXXXX-X
    cnic: {
      type: String,
      required: true,
      unique: true,
      match: /^[0-9]{5}-[0-9]{7}-[0-9]$/,
    },

    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 20,
    },

    vehicle: {
      type: vehicleSchema,
      required: true,
    },

    // Drivers must be approved by an admin before offering rides.
    verificationStatus: {
      type: String,
      enum: DRIVER_VERIFICATION_STATUSES,
      default: "pending",
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 300,
      default: null,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

driverProfileSchema.index(
  { "vehicle.plateNumber": 1 },
  { unique: true }
);

driverProfileSchema.index({ verificationStatus: 1, createdAt: -1 });

const DriverProfile = mongoose.model(
  "DriverProfile",
  driverProfileSchema
);

export default DriverProfile;
