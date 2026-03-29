const User = require("../models/User");

// Create User
exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, role, emergencyContacts } = req.body;

    const user = new User({
      name,
      email,
      phone,
      role,
      emergencyContacts,
    });

    await user.save();

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
