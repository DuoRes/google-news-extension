import moment from "moment";
import express from "express";
import User from "../models/User";
import { countValidClicks } from "../utils/tasks";
import OpenAI from "openai";
import Config from "../config";

const MINIMUM_CLICKS_REQUIRED = 100;
const PROLIFIC_COMPLETION_CODE = "yay_you_did_it";
const PREPROMPT = `You are an assistant researcher that can help with validating whether a research participant has successfully logged into the following google account: $name$; validate the screenshot image the user has uploaded that they have logged into the designated account. if the user has not logged in, ask them to log in and upload a new screenshot image; make sure that the username matches the one in the screenshot. If the user has indeed logged in, then reply "YES", otherwise reply "NO".`;

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
  } catch (error) {
    console.trace(error);
    return res.status;
  }
});

router.post("/login", async (req, res) => {
  try {
    const token = req.body.token;
    const user = await User.findOne({ token });
    if (!user) {
      const newUser = await User.create({ token });
      return res.send(newUser);
    }
    console.log("user", user);
    return res.status(200).send(user);
  } catch (error) {
    console.trace(error);
    return res.status(500).send(error);
  }
});

// check if the tasks are done for the user
router.get("/status", async (req, res) => {
  try {
    const token = req.body.token;
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).send("User not found");
    }
    const content_clicked = await countValidClicks(user._id);

    if (content_clicked < MINIMUM_CLICKS_REQUIRED) {
      return res.send({ ok: false, content_clicked });
    }

    res.send({
      ok: true,
      completion_code: PROLIFIC_COMPLETION_CODE,
      content_clicked,
    });
  } catch (error) {
    console.trace(error);
  }
});

// validate the screenshot image the user has uploaded that they have logged into the designated account using gpt-4v
// TODO add multer middleware to handle image upload
router.get("/validateImage", async (req, res) => {
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

export default router;
