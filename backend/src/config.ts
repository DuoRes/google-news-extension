// server/config.ts
import nodeConfig from "config";
import "dotenv/config";
interface Config {
  port: number;
  emailPrivateKey: string;
  accessToken: string;
  mongoDbUri: string;
}

const config: Config = {
  port: nodeConfig.get<number>("port"),
  emailPrivateKey: process.env.EMAIL_PRIV_KEY,
  accessToken: process.env.ACCESS_TOKEN,
  mongoDbUri: nodeConfig.get<string>("db"),
};

export default config;
