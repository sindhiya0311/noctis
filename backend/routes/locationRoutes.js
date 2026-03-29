const express = require("express");
const router = express.Router();

const { updateLocation } = require("../controllers/locationController");

// ✅ POST route
router.post("/", updateLocation);

module.exports = router;
