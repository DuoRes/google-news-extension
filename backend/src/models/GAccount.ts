import mongoose from "mongoose";
import moment from "moment";

const GAccountSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  isAssigned: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
  },
  recoveryEmail: {
    type: String,
  },

  // Experiment Branches
  type: {
    type: String, // "pert-left" or "pert-right" or "follow-left" or "follow-right"
    default: "blank",
  },
  chatBoxEnabled: {
    type: Boolean,
    default: false,
  },
  warningMessageEnabled: {
    type: Boolean,
    default: false,
  },

  // Experiment Tracking
  batch: {
    type: String, // "pilot-0"
  },
});

const GAccount = mongoose.model("GAccount", GAccountSchema);

export default GAccount;
