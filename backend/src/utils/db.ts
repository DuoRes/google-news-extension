import mongoose from "mongoose";
import debug from "debug";
import Config from "../config";
import GAccount from "../models/GAccount";
import accounts from "../../data/accounts.json"; // currently using pilot-0 accounts
const dbDebugger = debug("app:db");

// Switching to test database
// NODE_ENV=test node index.js
// Db Work: dbDebugger('')

export const connectDB = async () => {
  console.log("Connecting to MongoDB URI: ", Config.mongoDbUri);
  await mongoose
    .connect(Config.mongoDbUri)
    .then(() => {
      console.log("Connected to MongoDB...");
      dbDebugger(`Connect to ${Config.mongoDbUri}...`);
    })
    .catch((err: any) => console.log(err));
};

export const importAccounts = async (experiment_tag: string) => {
  console.log("Importing accounts...");
  await Promise.all(
    accounts.blank_accounts.map(async (account: any) => {
      try {
        const newAccount = await GAccount.create({
          email: account.email,
          password: account.password,
          recoveryEmail: account.recovery,
          type: "blank",
          batch: experiment_tag,
        });
        console.log("Imported blank account:", newAccount.email);
      } catch (err) {
        console.log(err);
      }
    })
  );
  console.log("Imported accounts");
};

process.on("SIGTERM", function () {
  console.log("SIGTERM received, closing MongoDB connection");
  //mongoose.disconnect();
});

process.on("SIGINT", function () {
  console.log("SIGINT received, closing MongoDB connection");
  //mongoose.disconnect();
});
