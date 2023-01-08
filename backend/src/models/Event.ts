import mongoose from "mongoose";
import moment from "moment";

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
    default: moment().format("YYYY-MM-DD:HH"),
  },
});

const Event = mongoose.model("Event", EventSchema);

export default Event;
