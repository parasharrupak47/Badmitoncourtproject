const mongoose = require("mongoose");

const courtSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    address: String,
    latitude: Number,
    longitude: Number,
    courtNumber: { type: String, required: true },
    surface: {
      type: String,
      enum: ["wood", "synthetic", "concrete"],
      required: true,
    },
    capacity: { type: Number, default: 4 },
    amenities: [String], // e.g., ['parking', 'restroom', 'drinking water']
    images: [String],
    hourlyRate: { type: Number, required: true },
    description: String,
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Court", courtSchema);
