import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  messages: {
    type: [String],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },

  // TODO: implement this
  session: {
    type: Number,
  },
});

const Chat = mongoose.model("Chat", ChatSchema);

export default Chat;
