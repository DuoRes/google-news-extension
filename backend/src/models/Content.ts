import mongoose from "mongoose";
import moment from "moment";

const ContentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  title: {
    type: String,
    required: true,
  },
  pressName: { type: String },
  reporter: { type: String },
  content: { type: String },
  url: { type: String },
  displayImageURI: {
    type: String,
  },
  publishTimestamp: {
    type: String,
  },
  ranking: {
    type: String,
  },
  clicked: {
    type: Boolean,
    default: false,
  },
  section: {
    type: String,
  },
  type: {
    type: String,
  },
  recommendation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recommendation",
  },

  // Unimplemented fields
  percentageRead: {
    type: Number,
  },
  timeSpent: {
    type: Number,
  },
  timestamp: {
    type: Date,
    default: moment().toDate(),
  },
  batch: {
    type: String,
  },
});

const Content = mongoose.model("Content", ContentSchema);

export default Content;
