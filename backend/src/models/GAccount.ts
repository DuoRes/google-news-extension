import mongoose from "mongoose";
import moment from "moment";

const GAccountSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  isAssigned: {
    type: Boolean,
  },
  stance: {
    type: String, // "left" or "right"
    default: "neutral",
  },
});
