// server/config.ts
import nodeConfig from "config";
import "dotenv/config";
interface Config {
  port: number;
  emailPrivateKey: string;
  accessToken: string;
  mongoDbUri: string;
  openaiApiKey: string;
}

const config: Config = {
  port: nodeConfig.get<number>("port"),
  emailPrivateKey: process.env.EMAIL_PRIV_KEY,
  accessToken: process.env.ACCESS_TOKEN,
  mongoDbUri: process.env.MONGODB_URI,
  openaiApiKey: process.env.OPENAI_API_KEY,
};

export const EXPERIMENT_BATCH = "main-1";

export default config;
