import mongoose from "mongoose";

const RecommendationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  contents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
    },
  ],
  timestamp: {
    type: Date,
  },
  politicalStanceRating: {
    type: Number,
  },
  selectedContent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Content",
  },
  batch: {
    type: String,
  },
});

const Recommendation = mongoose.model("Recommendation", RecommendationSchema);

export default Recommendation;
