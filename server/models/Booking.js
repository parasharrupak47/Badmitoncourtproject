const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    slot: { type: mongoose.Schema.Types.ObjectId, ref: "Slot", required: true },
    court: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Court",
      required: true,
    },
    gameType: {
      type: String,
      enum: ["singles", "doubles", "mixed_doubles"],
      required: true,
    },
    partner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // For doubles/mixed doubles
    partners: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // For doubles/mixed doubles
    date: { type: Date, required: true },
    startTime: String,
    endTime: String,
    duration: Number,
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "confirmed",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "paid",
    },
    matchOutcome: {
      winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      loser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Booking", bookingSchema);
