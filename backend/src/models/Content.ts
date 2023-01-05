import mongoose from "mongoose";

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
  consumedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  consumptionEvents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
  ],
});

const Content = mongoose.model("Content", ContentSchema);

export default Content;
