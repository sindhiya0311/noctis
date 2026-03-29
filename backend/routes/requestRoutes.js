const express = require("express");
const router = express.Router();

const Request = require("../models/Request");
const User = require("../models/User");

// SEND REQUEST
router.post("/send", async (req, res) => {
  try {
    const { fromUser, email, type } = req.body;

    const toUser = await User.findOne({ email });

    if (!toUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const request = await Request.create({
      fromUser,
      toUser: toUser._id,
      type,
      status: "pending",
    });

    res.json(request);
  } catch {
    res.status(500).json({ message: "Failed to send request" });
  }
});

// GET PENDING REQUESTS
router.get("/:userId", async (req, res) => {
  const requests = await Request.find({
    toUser: req.params.userId,
    status: "pending",
  });

  res.json(requests);
});

// GET LINKED USERS
router.get("/linked/:userId", async (req, res) => {
  const linked = await Request.find({
    $or: [{ toUser: req.params.userId }, { fromUser: req.params.userId }],
    status: "accepted",
  });

  res.json(linked);
});

// ACCEPT
router.post("/accept", async (req, res) => {
  const { requestId } = req.body;

  const request = await Request.findById(requestId);

  request.status = "accepted";
  await request.save();

  res.json({ success: true });
});

// REJECT
router.post("/reject", async (req, res) => {
  const { requestId } = req.body;

  const request = await Request.findById(requestId);

  request.status = "rejected";
  await request.save();

  res.json({ success: true });
});

module.exports = router;
