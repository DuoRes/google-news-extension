import moment from "moment";
import express from "express";
import Content from "../models/Content";
import Recommendation from "../models/Recommendation";
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
router.post("/contents", async (req, res) => {
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
    console.trace(err);
    return res.status(400).send("Error collecting activity: " + err);
  }
});

router.post("/recommendations", async (req, res) => {
  try {
    const user = User.findOne({ token: req.body.token });
    const contents = JSON.parse(req.body.contents);
    const contentDocuments = [];
    contents.forEach(async (content) => {
      const newContent = await Content.create({
        ranking: content.index,
        title: content.title,
        pressName: content.press,
        url: content.link,
        publishTimestamp: content.timestamp,
        displayImageURI: content.image,
        user: user,
        timestamp: moment().format("YYYY-MM-DD:HH"),
      });
      contentDocuments.push(newContent);
    });
    const recommendation = await Recommendation.create({
      user: user,
      contents: contentDocuments,
      timestamp: moment().format("YYYY-MM-DD:HH"),
    });
    const result = await User.findOneAndUpdate(user, {
      $push: { recommendations: recommendation },
    });

    return res.status(201).json(result);
  } catch (err) {
    console.trace(err);
    return res.status(400).send("Error collecting activity: " + err);
  }
});

export default router;
