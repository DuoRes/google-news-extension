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
      batch: EXPERIMENT_BATCH,
    });
    return res.status(201).json(content);
  } catch (err) {
    console.trace(err);
    return res.status(400).send("Error collecting activity: " + err);
  }
});

router.post("/recommendations", async (req, res) => {
  try {
    const user = await User.findById(req.body.user_id).exec();
    if (!user) {
      return res.status(400).send("User not found");
    }

    // Create an empty recommendation first
    const initialRecommendation = await Recommendation.create({
      user: user,
      contents: [],
      timestamp: moment().toDate(),
      politicalStanceRating: null,
      batch: EXPERIMENT_BATCH,
    });

    const contents = JSON.parse(req.body.contents);
    const contentDocuments = [];
    await Promise.all(
      contents.map(async (content) => {
        const newContent = await Content.create({
          ranking: content.index,
          title: content.title,
          pressName: content.press,
          recommendation: initialRecommendation._id, // Link content to the initial recommendation
          url: content.link,
          publishTimestamp: content.timestamp,
          displayImageURI: content.image,
          user: user,
          reporter: content.reporter,
          type: content.type ? content.type : "default",
          section: content.section ? content.section : "default",
          timestamp: moment().toDate(),
          batch: EXPERIMENT_BATCH,
        });
        contentDocuments.push(newContent);
      })
    );

    const pressFrequencyMap = {};
    contentDocuments.forEach((content) => {
      if (pressFrequencyMap[content.pressName]) {
        pressFrequencyMap[content.pressName]++;
      } else {
        pressFrequencyMap[content.pressName] = 1;
      }
    });

    let currentStance = await ratePressesPoliticalStanceIfNotExists(
      pressFrequencyMap
    );

    if (isNaN(currentStance) || !currentStance) {
      currentStance = 123456789;
    }

    // Update the initial recommendation with the contents and political stance rating
    initialRecommendation.contents = contentDocuments;
    initialRecommendation.politicalStanceRating = currentStance;
    await initialRecommendation.save();

    await User.updateOne(
      {
        token: req.body.token,
      },
      {
        $push: {
          recommendations: initialRecommendation,
        },
      }
    );

    return res.status(201).json({ currentStance: currentStance, test: "test" });
  } catch (err) {
    console.trace(err);
    return res.status(400).send("Error collecting activity: " + err);
  }
});

router.post("/link-clicked", async (req, res) => {
  try {
    const user = await User.findById(req.body.user_id).exec();
    if (!user) {
      return res.status(400).send("User not found");
    }

    const link = req.body.link;
    // find the content with the user and link
    const content = await Content.findOne({
      user: user,
      url: link,
    })
      .sort({ timestamp: -1 })
      .exec();

    if (!content) {
      return res.status(400).send("Content not found");
    }
    const result = await Content.updateOne(
      {
        user: user,
        url: link,
      },
      {
        clicked: true,
      }
    );
    return res.status(200).json(result);
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
