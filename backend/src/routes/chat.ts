import express from "express";
import Config from "../config";
import {
  Configuration,
  OpenAIApi,
  ChatCompletionRequestMessageRoleEnum as OpenAIRoles,
} from "openai";
import { parse } from "path";

const router = express.Router();

const MODEL = "gpt-3.5-turbo";
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

const parseResponse = (response: any) => {
  const choices = response.data.choices;
  const lastChoice = choices[choices.length - 1];
  const text = lastChoice.message.content;
  const splitText = text.split("\n");
  const answer = splitText[splitText.length - 1];
  return answer;
};

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
    return res.status(200).send(parseResponse(response));
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
    return res.status(200).send(parseResponse(response));
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
