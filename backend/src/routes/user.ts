import express from "express";
import User from "../models/User";
import Chat from "../models/Chat";
import GAccount from "../models/GAccount";

import { getClickStats } from "../utils/tasks";
import OpenAI from "openai";
import Config from "../config";
import { extractGoogleEmail } from "../utils/ocr";
import { uploadImages } from "../middleware/multer";
import aws from "aws-sdk";
import fs from "fs";
import {
  chatBotNames,
  getRandomLeftOpening,
  getRandomRightOpening,
  getSystemPrompt,
} from "./chat";
import { EXPERIMENT_BATCH } from "../config";

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: "us-west-1",
});

const s3 = new aws.S3();

const PROLIFIC_COMPLETION_CODE = "yay_you_did_it";
const PREPROMPT = `You are an assistant researcher that can help with validating whether a research participant has successfully logged into the following google account: $name$; validate the screenshot image the user has uploaded that they have logged into the designated account. if the user has not logged in, ask them to log in and upload a new screenshot image; make sure that the username matches the one in the screenshot. If the user has indeed logged in, then reply "YES", otherwise reply "NO".`;
const PRE_SURVEY_COMPLETION_CODE =
  "thank_you_for_completing_the_haas_research_pre_survey";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const token = req.body.token;
    const user = await User.findOne({ token });
    if (!user) {
      const randomGAccounts = await GAccount.aggregate([
        {
          $match: {
            $or: [
              { $and: [{ batch: EXPERIMENT_BATCH }, { isAssigned: false }] },
              {
                $and: [
                  { batch: EXPERIMENT_BATCH },
                  { isAssigned: { $exists: false } },
                ],
              },
            ],
          },
        },
        { $sample: { size: 1 } },
      ]);

      const randomGAccount = randomGAccounts[0];

      if (!randomGAccount) {
        return res.status(404).send("No available accounts");
      }

      const newUser = await User.create({
        token,
        displayChatBox: randomGAccount.chatBoxEnabled,
        displayWarningMessage: randomGAccount.warningMessageEnabled,
        assignedEmail: randomGAccount.email,
        assignedPassword: randomGAccount.password,
        assignedRecoveryEmail: randomGAccount.recoveryEmail,
        stance: randomGAccount.type,
        batch: EXPERIMENT_BATCH,
      });

      if (newUser.displayChatBox) {
        const stance = Math.random() > 0.5 ? "left" : "right";
        const openingMessage =
          stance === "left"
            ? await getRandomLeftOpening()
            : await getRandomRightOpening();
        const chat = await Chat.create({
          user: newUser._id,
          assignedStance: stance,
          messages: [
            {
              role: "system",
              content: getSystemPrompt(stance) + openingMessage,
            },
            {
              role: "assistant",
              content: openingMessage,
            },
          ],
          batch: EXPERIMENT_BATCH,
        });
        newUser.chatRecord = chat._id;
        newUser.chatBotStance = stance;
        newUser.chatBotName =
          chatBotNames[Math.floor(Math.random() * chatBotNames.length)];
        await newUser.save();
      }

      await GAccount.updateOne(
        { _id: randomGAccount._id },
        { isAssigned: true }
      );

      return res.send(newUser);
    }

    await user.populate("chatRecord");

    return res.status(200).send(user);
  } catch (error) {
    console.trace(error);
    return res.status(500).send(error);
  }
});

router.get("/status/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).send("User ID is required");
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    const clickStats = await getClickStats(user._id);

    if (!clickStats.isCompleted) {
      return res.send({ ok: false, content_clicked: clickStats.count });
    }

    res.send({
      ok: true,
      completion_code: PROLIFIC_COMPLETION_CODE,
      content_clicked: clickStats.count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * @route POST /user/validateImageOCR
 * @desc Validate the screenshot image the user has uploaded that they have logged into the designated account using OCR
 * @param {string} token - The user's prolific token
 * @param {file} screenshot - The screenshot image file
 * @return {object} - The extracted email and its confidence
 */
router.post(
  "/validateImageOCR",
  uploadImages.single("screenshot"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    try {
      const user = await User.findOne({ token: req.body.token });
      if (!user) {
        return res.status(400).send("User not found");
      }
      const assignedEmail = user.assignedEmail;
      const localImagePath = req.file.path; // Path to the locally stored file

      const [extractedEmail, confidence] = await extractGoogleEmail(
        localImagePath,
        assignedEmail
      );

      if (confidence < 80) {
        fs.unlinkSync(localImagePath); // Delete the local file
        return res
          .status(400)
          .send("Low confidence in OCR processing: " + confidence.toString());
      }

      // Upload file to S3
      const fileContent = fs.readFileSync(localImagePath);
      const params = {
        Bucket: "duo-research-storage",
        Key: `screenshots/${Date.now().toString()}-${req.file.originalname}`,
        Body: fileContent,
      };
      const uploadResult = await s3.upload(params).promise();
      fs.unlinkSync(localImagePath); // Delete the local file after upload

      user.loginScreenshot = uploadResult.Location; // S3 URL
      await user.save();

      return res.json({
        message: "File uploaded and processed successfully.",
        extractedEmail: extractedEmail,
        confidence: confidence,
      });
    } catch (error) {
      console.error(error);
      fs.unlinkSync(req.file.path); // Ensure to delete local file in case of error
      return res.status(500).send("Error processing the file.");
    }
  }
);

// validate the screenshot image the user has uploaded that they have logged into the designated account using gpt-4v
router.get("/validateImageGPT4V", async (req, res) => {
  try {
    const image = req.body.image; // Assuming the image is sent in the request body

    // Make an API call to the GPT-4v multi-modal model
    const openai = new OpenAI({ apiKey: Config.openaiApiKey });
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      max_tokens: 1000,
      messages: [
        {
          role: "system",
          content: PREPROMPT.replace("$name$", req.body.name),
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: image,
                detail: "auto",
              },
            },
          ],
        },
      ],
      functions: [
        {
          name: "validateImage",
          parameters: {
            loggedIn: {
              type: "boolean",
              description:
                "Whether the user has logged in to the specific google account based on the image",
            },
          },
        },
      ],
      function_call: {
        name: "validateImage",
      },
    });

    // Process the response and determine if the user has logged in
    const completion = response.choices[0].message.content;
    const isLoggedIn = completion.toLowerCase().includes("logged in");

    res.send(isLoggedIn);
  } catch (error) {
    console.trace(error);
    res.send(false);
  }
});

router.post("/validatePreSurveyCompletion", async (req, res) => {
  try {
    const token = req.body.token;
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).send("User not found");
    }
    const completion_code = req.body.completion_code;
    if (completion_code !== PRE_SURVEY_COMPLETION_CODE) {
      return res.status(400).send("Invalid completion code");
    }
    user.preSurveyCompleted = true;
    await user.save();
    res.send("Pre-survey completion validated");
  } catch (error) {
    console.trace(error);
    res.status;
  }
});

export default router;
