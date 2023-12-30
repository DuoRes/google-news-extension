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

export const parseResponse = async (response: any, user: any) => {
  const messages = response.choices[0].messages || response.data.choices;
  console.log(messages);
  try {
    const chat = await Chat.create({
      user: user,
      messages: messages,
    });
    await user.chats.push(chat);
    await user.save();
  } catch (err) {
    console.trace(err);
  }
  console.log(messages);
  const lastMessage = messages[messages.length - 1];
  const text = lastMessage.message.content;
  return text;
};

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
        content: `You are a leftwing news reporter who knows all the recent news events from the headlines attached. You should try to display the information in a left-wing reporter fashion. ${COMMON_PROMPT} ${latestRec.toJSON()}`,
      };
    } else if (stance === "right") {
      return {
        role: "system",
        content: `You are a rightwing news reporter who knows all the recent news events from the headlines attached. You should try to display the information in a right-wing reporter fashion. ${COMMON_PROMPT} ${latestRec.toJSON()}`,
      };
    } else {
      return {
        role: "system",
        content: `You are a news reporter who knows all the recent news events from the headlines attached. You should try to display the information in a neutral fashion. ${COMMON_PROMPT} ${latestRec.toJSON()}`,
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
    const stance = user.stance;
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
    return res.status(200).send(await parseResponse(response, user));
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
