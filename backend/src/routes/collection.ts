import moment from "moment";
import express from "express";
import Content from "../models/Content";
import User from "../models/User";
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

// create a new content
router.post("/content", async (req, res) => {
  try {
    const content = await Content.create({
      title: req.body.title,
      pressName: req.body.pressName,
      content: req.body.content,
      url: req.body.url,
      publishTimestamp: req.body.publishTimestamp,
      user: req.body.user,
      contentRanking: req.body.contentRanking,
      percentageRead: req.body.percentageRead,
      timeSpent: req.body.timeSpent,
      timestamp: moment().format("YYYY-MM-DD:HH"),
    });
    return res.status(201).json(content);
  } catch (err) {
    return res.status(400).send("Error collecting activity: " + err);
  }
});

export default router;
