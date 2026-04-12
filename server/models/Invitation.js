const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema(
  {
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
    },
    inviter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invitee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gameType: {
      type: String,
      enum: ["singles", "doubles", "mixed_doubles"],
      required: true,
    },
    splitPrice: {
      type: Number,
      required: true,
    }, // Price per person after split
    totalPrice: {
      type: Number,
      required: true,
    }, // Total slot price
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "expired"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    }, // Expires in 24 hours
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Invitation", invitationSchema);
