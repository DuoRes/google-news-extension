import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  content: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Content",
  },
  contentRanking: {
    type: Number,
  },
  percentageRead: {
    type: Number,
  },
  timeSpent: {
    type: Number,
  },
  timestamp: {
    type: Date,
    default: Date.now(),
  },
});

const Event = mongoose.model("Event", EventSchema);

export default Event;
