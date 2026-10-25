
import mongoose from "mongoose";

import { CONTACT_TOPICS } from "../../utils/constants.js";

// Messages sent from the website contact form.
const contactMessageSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },

    phone: {
      type: String,
      trim: true,
      default: null,
    },

    topic: {
      type: String,
      required: true,
      enum: CONTACT_TOPICS,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    // Whether the team notification email was delivered.
    emailed: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["new", "resolved"],
      default: "new",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

contactMessageSchema.index({ status: 1, createdAt: -1 });

const ContactMessage = mongoose.model(
  "ContactMessage",
  contactMessageSchema
);

export default ContactMessage;
