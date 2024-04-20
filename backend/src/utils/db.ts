import mongoose from "mongoose";
import debug from "debug";
import Config from "../config";
import GAccount from "../models/GAccount";
import accounts from "../../data/accounts.json"; // currently using pilot-0 accounts
import goodAccounts from "../../data/good_accounts.json"; // currently using pilot-1 accounts
import { EXPERIMENT_BATCH } from "../config";
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

export const importAccounts = async () => {
  console.log("Importing accounts...");
  await Promise.all(
    goodAccounts.map(async (account: any) => {
      try {
        const existing = await GAccount.findOne({ email: account.email });
        if (existing) {
          console.log("Account already exists:", account.email);
          if (existing.isAssigned === true) {
            console.log("Updating batch for account:", account.email);
            existing.batch = "pilot-0";
            await existing.save();
          }
          return;
        }
        const randNum = Math.random();

        let newAccount;

        if (randNum < 0.1) {
          newAccount = await GAccount.create({
            email: account.email,
            password: account.password,
            recoveryEmail: account.recovery,
            type: "blank",
            batch: EXPERIMENT_BATCH,
            displayChatBox: true,
            displayWarningMessage: false,
          });
        } else if (randNum < 0.2) {
          newAccount = await GAccount.create({
            email: account.email,
            password: account.password,
            recoveryEmail: account.recovery,
            type: "blank",
            batch: EXPERIMENT_BATCH,
            displayChatBox: false,
            displayWarningMessage: true,
          });
        } else {
          newAccount = await GAccount.create({
            email: account.email,
            password: account.password,
            recoveryEmail: account.recovery,
            type: "blank",
            batch: EXPERIMENT_BATCH,
            displayChatBox: false,
            displayWarningMessage: false,
          });
        }
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
