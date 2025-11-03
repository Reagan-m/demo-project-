import Message from "../models/messageModel.js";

export const sendMessage = async (req, res) => {
  try {
    const { sender, receiver, text } = req.body;
    const message = await Message.create({ sender, receiver, text });
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMessages = async (req, res) => {
  const { userId, otherId } = req.params;
  const messages = await Message.find({
    $or: [
      { sender: userId, receiver: otherId },
      { sender: otherId, receiver: userId }
    ]
  }).populate("sender receiver", "name email");
  res.json(messages);
};
