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
});

const Recommendation = mongoose.model("Recommendation", RecommendationSchema);

export default Recommendation;
