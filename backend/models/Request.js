const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  fromUser: String, // worker id
  toUser: String, // family id
  type: String, // family or enterprise
  status: {
    type: String,
    default: "pending",
  },
});

module.exports = mongoose.model("Request", requestSchema);
