import moment from "moment";
import express from "express";
import Content from "../models/Content";
import User from "../models/User";
import Event from "../models/Event";
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const user = User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send("User not found");
    }
  } catch (err) {
    return res.status(400).send("Error collecting activity: " + err);
  }
});

export default router;
