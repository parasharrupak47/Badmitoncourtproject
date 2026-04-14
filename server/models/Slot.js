const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema(
  {
    court: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Court",
      required: true,
    },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // HH:MM format
    endTime: { type: String, required: true },
    duration: {
      type: Number,
      enum: [30, 45, 60, 90],
      required: true,
    }, // in minutes
    gameType: {
      type: String,
      enum: ["singles", "doubles", "mixed_doubles"],
      required: true,
    },
    pricePerSlot: { type: Number, required: true },
    isAvailable: { type: Boolean, default: true },
    bookingMode: {
      type: String,
      enum: ["public", "invite_only"],
      default: "public",
    },
    inviteHost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    maxPlayers: { type: Number, required: true }, // 2 for singles, 4 for doubles
    bookedPlayers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Slot", slotSchema);
