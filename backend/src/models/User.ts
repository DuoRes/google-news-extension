import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  recommendations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recommendation",
    },
  ],
  chats: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
  ],
  loginScreenshot: {
    type: String,
  },

  // Experiment fields
  displayChatBox: {
    type: Boolean,
    default: true,
  },
  stance: {
    type: String, // "left" or "right"
    default: "neutral",
  },
  chatBotStance: {
    type: String, // "left" or "right"
    default: "neutral",
  },
  assignedGmail: {
    type: String,
  },
  assignedPassword: {
    type: String,
  },
  assignedBackupGmail: {
    type: String,
  },
});

const User = mongoose.model("User", UserSchema);

export default User;
