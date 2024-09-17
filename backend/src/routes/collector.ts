import moment from "moment";
import express from "express";
import Content from "../models/Content";
import Recommendation from "../models/Recommendation";
import User from "../models/User";
import * as cheerio from "cheerio";
import { ratePressesPoliticalStanceIfNotExists } from "../utils/scorer";
import { EXPERIMENT_BATCH } from "../config";

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

router.post("/recommendations", async (req, res) => {
  try {
    const user = await User.findById(req.body.user_id).exec();
    if (!user) {
      return res.status(400).send("User not found");
    }

    const initialRecommendation = await Recommendation.create({
      user: user._id,
      contents: [],
      timestamp: moment().toDate(),
      politicalStanceRating: null,
      batch: EXPERIMENT_BATCH,
    });

    const contents = JSON.parse(req.body.contents);

    const contentDocuments = await Promise.all(
      contents.map(async (content) => {
        return await Content.create({
          ranking: content.index,
          title: content.title,
          pressName: content.press,
          recommendation: initialRecommendation._id,
          url: content.link,
          publishTimestamp: content.timestamp,
          displayImageURI: content.image,
          user: user._id,
          reporter: content.reporter,
          type: content.type || "default",
          section: content.section || "default",
          timestamp: moment().toDate(),
          batch: EXPERIMENT_BATCH,
        });
      })
    );

    const pressFrequencyMap = {};
    contentDocuments.forEach((content) => {
      pressFrequencyMap[content.pressName] =
        (pressFrequencyMap[content.pressName] || 0) + 1;
    });

    let currentStance = await ratePressesPoliticalStanceIfNotExists(
      pressFrequencyMap
    );

    if (isNaN(currentStance) || !currentStance) {
      currentStance = 123456789;
    }

    initialRecommendation.contents = contentDocuments.map(
      (content) => content._id
    );
    initialRecommendation.politicalStanceRating = currentStance;
    await initialRecommendation.save();

    user.recommendations.push(initialRecommendation._id);
    await user.save();

    return res.status(201).json({ currentStance: currentStance });
  } catch (err) {
    console.trace(err);
    return res.status(400).send("Error collecting activity: " + err);
  }
});

router.post("/link-clicked", async (req, res) => {
  try {
    const userId = req.body.user_id;
    const link = req.body.link;

    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(400).send("User not found");
    }

    const content = await Content.findOneAndUpdate(
      {
        user: user._id,
        url: link,
      },
      {
        $set: { clicked: true },
      },
      {
        new: true,
      }
    ).exec();

    if (!content) {
      return res.status(400).send("Content not found");
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.trace(err);
    return res.status(400).send("Error collecting clicked link: " + err);
  }
});

export default router;

/*************************************************************************
 *                          Helper Functions                             *
 *************************************************************************/
const getMainContent = (html: string) => {
  const $ = cheerio.load(html);
  const mainContent = $("article").text();
  return mainContent;
};

const getSummary = (html: string) => {
  // TODO: Implement using NLP
};
