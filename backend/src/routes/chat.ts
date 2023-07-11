import express from "express";
import Config from "../config";
import {
  Configuration,
  OpenAIApi,
  ChatCompletionRequestMessageRoleEnum as OpenAIRoles,
} from "openai";

const router = express.Router();

const MODEL = "gpt-3.5";
const LEFT_PREPROMPT = {
  role: OpenAIRoles.System,
  content: `You are a rightwing news reporter who knows all the recent news events. Answer the following questions about the news.`,
};
const RIGHT_PREPROMPT = {
  role: OpenAIRoles.System,
  content: `You are a leftwing news reporter who knows all the recent news events. Answer the following questions about the news.`,
};

const openai = new OpenAIApi(
  new Configuration({ apiKey: Config.openaiApiKey })
);

router.get("/", (req, res) => {
  res.send("Hello from NewsGPT!");
});

router.post("/right", async (req, res) => {
  try {
    const message = req.body.message;
    const userMessage = { role: OpenAIRoles.User, content: message };
    const response = await openai.createChatCompletion({
      messages: [RIGHT_PREPROMPT, userMessage],
      model: MODEL,
      max_tokens: 150,
    });
    return res.status(200).send(response.data);
  } catch (error: any) {
    console.trace(error);
    return res
      .status(500)
      .send(
        "Sorry about that! NewsGPT's having a bad day. It's having troubles with " +
          error.message
      );
  }
});

router.post("/left", async (req, res) => {
  try {
    const message = req.body.message;
    console.log("Message", message);
    const userMessage = { role: OpenAIRoles.User, content: message };
    const response = await openai.createChatCompletion({
      messages: [LEFT_PREPROMPT, userMessage],
      model: MODEL,
      max_tokens: 150,
    });
    return res.status(200).send(response.data);
  } catch (error: any) {
    console.trace(error);
    return res
      .status(500)
      .send(
        "Sorry about that! NewsGPT's having a bad day. It's having troubles with " +
          error.message
      );
  }
});

export default router;
