const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,
    role: {
      type: String,
      enum: ["player", "staff", "admin"],
      default: "player",
    },
    profileImage: String,
    gender: { type: String, enum: ["male", "female", "other"] },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    matchesWon: { type: Number, default: 0 },
    matchesPlayed: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now },
    bio: String,
    preferences: {
      singleDuration: { type: Number, default: 60 }, // in minutes
      doublesDuration: { type: Number, default: 60 },
      preferredTime: {
        type: String,
        enum: ["morning", "afternoon", "evening"],
        default: "evening",
      },
    },
  },
  { timestamps: true },
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (this.isModified("password")) {

      try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
      } catch (error) {
        throw new Error("Error hashing password");
      } 
  }

});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
