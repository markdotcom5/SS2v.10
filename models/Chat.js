const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  messages: [{ sender: String, text: String, timestamp: Date }],
});

module.exports = mongoose.model("Chat", ChatSchema);
