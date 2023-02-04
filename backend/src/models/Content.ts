import mongoose from "mongoose";
import moment from "moment";

const ContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  pressName: { type: String },
  content: { type: String },
  url: { type: String },
  publishTimestamp: {
    type: Date,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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

const Content = mongoose.model("Content", ContentSchema);

export default Content;
