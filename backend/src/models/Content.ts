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
});

const Content = mongoose.model("Content", ContentSchema);

export default Content;
