const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");

// Save chat to MongoDB
router.post("/save", async (req, res) => {
  const { userId, message, sender } = req.body;
  try {
    await Chat.findOneAndUpdate(
      { userId },
      { $push: { messages: { sender, text: message, timestamp: new Date() } } },
      { upsert: true }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to save chat" });
  }
});

// Retrieve chat history
router.get("/history", async (req, res) => {
  const { userId } = req.query;
  try {
    const chat = await Chat.findOne({ userId });
    res.status(200).json({ messages: chat ? chat.messages : [] });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve chat history" });
  }
});

module.exports = router;
