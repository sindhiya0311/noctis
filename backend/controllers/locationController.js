const Location = require("../models/Location");
const { generateFeatures } = require("../utils/featureEngine");
const axios = require("axios");

// 🧠 Smart message generator (UPGRADED 🔥)
const generateMessage = (features, risk) => {
  if (risk === "Emergency") {
    if (features.isNight && features.isStopped) {
      return "🚨 Stopped in isolated area at night";
    }
    if (features.routeDeviation) {
      return "🚨 Dangerous route deviation detected";
    }
    return "🚨 High-risk situation detected";
  }

  if (risk === "Warning") {
    if (features.isNight) {
      return "Unusual movement detected at night";
    }
    if (features.isStopped) {
      return "Stopped for long duration";
    }
    return "Suspicious behavior detected";
  }

  if (risk === "Alert") {
    return "Slight anomaly in movement";
  }

  return "All safe";
};

// 📍 Store location + ML prediction
exports.updateLocation = async (req, res) => {
  try {
    const { userId, latitude, longitude, speed } = req.body;

    // 🔍 Get previous location
    const prev = await Location.findOne({ userId }).sort({ timestamp: -1 });

    const current = {
      latitude,
      longitude,
      speed,
      timestamp: new Date(),
    };

    // ⚙️ Feature engineering
    const features = generateFeatures(prev, current);

    // 🤖 Call ML API
    const mlResponse = await axios.post(
      "http://localhost:5001/predict",
      features,
    );

    const { anomaly, risk } = mlResponse.data;

    // 🧠 Generate smart message
    const message = generateMessage(features, risk);

    // 💾 Save to DB
    const location = new Location({
      userId,
      latitude,
      longitude,
      speed,
      ...features,
      anomaly,
      risk,
      message,
    });

    await location.save();

    // ⚡ SOCKET EMIT (REAL-TIME 🔥)
    const io = req.app.get("io");

    console.log("🔥 EMITTING:", {
      risk,
      message,
    });

    io.emit("risk-update", {
      userId,
      latitude,
      longitude,
      risk,
      message,
      anomaly,
      timestamp: new Date(),
    });

    // 🚨 ALERT LOGIC (for scaling)
    if (risk === "Emergency") {
      console.log("🚨 EMERGENCY ALERT TRIGGERED");
    } else if (risk === "Warning") {
      console.log("⚠️ Warning alert");
    } else if (risk === "Alert") {
      console.log("🔔 Mild alert");
    }

    // ✅ Response
    res.status(201).json({
      message: "Location + ML processed",
      location,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
