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
    type: String, // "left" or "right" or "neutral" or "blank"
    default: "neutral",
  },
  password: {
    type: String,
  },
  recoveryEmail: {
    type: String,
  },
});

const GAccount = mongoose.model("GAccount", GAccountSchema);

export default GAccount;
