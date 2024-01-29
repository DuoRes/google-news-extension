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

  await Promise.all(
    accounts.initial_perturbation_left_accounts.map(async (account: any) => {
      try {
        const newAccount = await GAccount.create({
          email: account.email,
          password: account.password,
          recoveryEmail: account.recovery,
          type: "pert-left",
          batch: experiment_tag,
        });
        console.log(
          "Imported initial perturbation left account:",
          newAccount.email
        );
      } catch (err) {
        console.log(err);
      }
    })
  );

  await Promise.all(
    accounts.initial_perturbation_right_accounts.map(async (account: any) => {
      try {
        const newAccount = await GAccount.create({
          email: account.email,
          password: account.password,
          recoveryEmail: account.recovery,
          type: "pert-right",
          batch: experiment_tag,
        });
        console.log(
          "Imported initial perturbation right account:",
          newAccount.email
        );
      } catch (err) {
        console.log(err);
      }
    })
  );

  await Promise.all(
    accounts.left_following_accounts.map(async (account: any) => {
      try {
        const newAccount = await GAccount.create({
          email: account.email,
          password: account.password,
          recoveryEmail: account.recovery,
          type: "follow-left",
          batch: experiment_tag,
        });
        console.log("Imported left following account:", newAccount.email);
      } catch (err) {
        console.log(err);
      }
    })
  );

  await Promise.all(
    accounts.right_following_accounts.map(async (account: any) => {
      try {
        const newAccount = await GAccount.create({
          email: account.email,
          password: account.password,
          recoveryEmail: account.recovery,
          type: "follow-right",
          batch: experiment_tag,
        });
        console.log("Imported right following account:", newAccount.email);
      } catch (err) {
        console.log(err);
      }
    })
  );

  await Promise.all(
    accounts.warning_messages_accounts.map(async (account: any) => {
      try {
        const newAccount = await GAccount.create({
          email: account.email,
          password: account.password,
          recoveryEmail: account.recovery,
          warningMessageEnabled: true,
          batch: experiment_tag,
        });
        console.log("Imported warning messages account:", newAccount.email);
      } catch (err) {
        console.log(err);
      }
    })
  );

  await Promise.all(
    accounts.chatbot_enabled_accounts.map(async (account: any) => {
      try {
        const newAccount = await GAccount.create({
          email: account.email,
          password: account.password,
          recoveryEmail: account.recovery,
          chatBoxEnabled: true,
          batch: experiment_tag,
        });
        console.log("Imported chatbot enabled account:", newAccount.email);
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
