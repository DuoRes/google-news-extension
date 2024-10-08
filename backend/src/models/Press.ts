import mongoose from "mongoose";

const PressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  politicalStance: {
    type: Number, // -100 to 100
    required: true,
  },
  leaning: {
    type: String, // left, right
    required: true,
  },
  ratingAuthor: {
    type: String, // author of rating; e.g. GPT-4 or Human
    required: true,
  },
  batch: {
    type: String, // "pilot-0"
  },
});

const Press = mongoose.model("Press", PressSchema);

export default Press;
