import moment from "moment";
import express from "express";
import Content from "../models/Content";
import User from "../models/User";
import { countValidClicks } from "../utils/tasks";

const MINIMUM_CLICKS_REQUIRED = 100;
const PROLIFIC_COMPLETION_CODE = "yay_you_did_it";

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

// check if the user has already logged in to chrome extension
router.get("/hasLoggedIn", async (req, res) => {});

export default router;
