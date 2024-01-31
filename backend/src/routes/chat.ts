import express from "express";
import Config from "../config";
import { OpenAI } from "openai";
import Recommendation from "../models/Recommendation";
import Chat from "../models/Chat";
import User from "../models/User";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const router = express.Router();

const MODEL = "gpt-3.5-turbo";
const MAX_TOKENS = 300;
const COMMON_PROMPT = `Answer the following questions about the news. Be succinct and to the point. You should aim to give all the information in one go and not rely on back and forth questions.`;

const openai = new OpenAI({ apiKey: Config.openaiApiKey });

export const parseResponse = async (
  response: any,
  user: any,
  userMessage: string
) => {
  const message = response.choices[0].message;
  const text = message.content;
  try {
    const chat = await Chat.create({
      user: user,
      userMessage,
      botMessage: text,
    });
    await user.chats.push(chat);
    await user.save();
  } catch (err) {
    console.trace(err);
  }
  return text;
};

// Don't be with the news, only chat, a person that you've met, 吐槽箱
const context = async (stance: string) => {
  try {
    const latestRec = await Recommendation.findOne(
      {},
      {},
      { sort: { timestamp: -1 } }
    )
      .populate("contents")
      .exec();
    if (stance === "left") {
      return {
        role: "system",
        content: `You are an average American with a left-wing political view. You are aware of all the recent news events from the attached headlines. Please provide your response in a manner that aligns with your left-wing perspective. ${COMMON_PROMPT} ${latestRec.toJSON()}`,
      };
    } else if (stance === "right") {
      return {
        role: "system",
        content: `You are an average American with a right-wing political view. You are aware of all the recent news events from the attached headlines. Please provide your response in a manner that aligns with your right-wing perspective. ${COMMON_PROMPT} ${latestRec.toJSON()}`,
      };
    } else {
      return {
        role: "system",
        content: `You are an average American with a neutral political view. You are aware of all the recent news events from the attached headlines. Please provide your response in a neutral manner. ${COMMON_PROMPT} ${latestRec.toJSON()}`,
      };
    }
  } catch (err) {
    console.trace(err);
  }
};

router.get("/", (req, res) => {
  res.send("Hello from NewsGPT!");
});

router.post("/", async (req, res) => {
  try {
    console.log(req.body);
    const user = await User.findById(req.body.user_id).exec();
    if (!user) {
      return res.status(400).send("User not found");
    }
    const stance = user.chatBotStance;
    const preprompt = (await context(
      stance || "neutral"
    )) as ChatCompletionMessageParam;
    const message = req.body.message;
    const userMessage: ChatCompletionMessageParam = {
      role: "user",
      content: message,
    };
    const response = await openai.chat.completions.create({
      messages: [preprompt, userMessage],
      model: MODEL,
      max_tokens: MAX_TOKENS,
    });
    return res.status(200).send(await parseResponse(response, user, message));
  } catch (error: any) {
    console.trace(error.message);
    return res
      .status(500)
      .send(
        "Sorry about that! NewsGPT's having a bad day. It's having troubles with " +
          error.message
      );
  }
});

export default router;
