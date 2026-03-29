const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  latitude: Number,
  longitude: Number,
  speed: Number,

  // 🔥 Feature Engineering Fields
  isNight: Number,
  distanceMoved: Number,
  timeGap: Number,
  isStopped: Number,
  movementChange: Number,

  // 🔥 ML Outputs
  anomaly: String,
  risk: String,

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Location", locationSchema);
