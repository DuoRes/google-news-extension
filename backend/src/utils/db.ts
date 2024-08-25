import mongoose from "mongoose";
import debug from "debug";
import Config from "../config";
import {
  GAccount,
  Chat,
  Content,
  Press,
  Recommendation,
  User,
} from "../models";
import { EXPERIMENT_BATCH } from "../config";
import fs from "fs";
import { promises as fsp } from "fs";

const COLLECTIONS = {
  gaccounts: GAccount,
  chats: Chat,
  contents: Content,
  presses: Press,
  recommendations: Recommendation,
  users: User,
};

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

export const importAccountsFromTXT = async (filePath: string) => {
  try {
    console.log("Importing accounts...");
    // Read the file content from the provided file path
    const fileContent = await fsp.readFile(filePath, "utf-8");

    const accounts = fileContent
      .trim()
      .split("\n")
      .map((line) => {
        const parts = line.split("----");
        return {
          email: parts[0].trim(),
          password: parts[1].trim(),
          recovery: parts[2].trim(),
          recoveryCode: parts[3]?.trim(), // This assumes the recovery code is optional
          countryCode: parts[4]?.trim() || "", // This assumes the country code is optional
        };
      });

    await Promise.all(
      accounts.map(async (account: any) => {
        try {
          const existing = await GAccount.findOne({ email: account.email });
          if (existing) {
            console.log("Account already exists:", account.email);
            if (existing.isAssigned !== true) {
              console.log("Updating batch for account:", account.email);
              existing.batch = EXPERIMENT_BATCH;
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
          console.trace(err);
        }
      })
    );
    console.log("Imported accounts");
  } catch (err) {
    console.error("Error reading the file:", err);
  }
};

export const importAccountsFromJSON = async (accounts: any) => {
  console.log("Importing accounts...");
  await Promise.all(
    accounts.map(async (account: any) => {
      try {
        const existing = await GAccount.findOne({ email: account.email });
        if (existing) {
          console.log("Account already exists:", account.email);
          if (existing.isAssigned !== true) {
            console.log("Updating batch for account:", account.email);
            existing.batch = EXPERIMENT_BATCH;
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
        console.trace(err);
      }
    })
  );
  console.log("Imported accounts");
};

export const reuseUnusedAccountsFromPreviousBatch = async () => {
  console.log("Reusing unused accounts from previous batch...");
  const unusedAccounts = await GAccount.find({
    batch: { $eq: "pilot-" + (parseInt(EXPERIMENT_BATCH.split("-")[1]) - 1) },
    isAssigned: false,
  });

  for (const account of unusedAccounts) {
    account.batch = EXPERIMENT_BATCH;
    await account.save();
    console.log("Reused account:", account.email);
  }
  console.log("Reused unused accounts from previous batch");
};

// export all collections to csv
export const exportAllToCSV = async () => {
  console.log("Exporting all collections to CSV...");
  if (!mongoose.connection.readyState) {
    throw new Error("MongoDB connection is not established");
  }

  const collections = await mongoose.connection
    .getClient()
    .db()
    .listCollections()
    .toArray();

  for (const collection of collections) {
    const name = collection.name;
    const model = COLLECTIONS[name];

    if (!model) {
      console.warn(`Model for collection ${name} not found`);
      continue;
    }

    if (fs.existsSync(`data/dataset/${EXPERIMENT_BATCH}/${name}.csv`)) {
      console.warn(`CSV file already exists for collection ${name}`);
      continue;
    }

    const data = await mongoose.connection.db.collection(name).find().toArray();

    if (data.length === 0) {
      console.warn(`No data found for collection ${name}`);
      continue;
    }

    const fields = Object.keys(model.schema.paths).filter(
      (field) => field !== "__v"
    );

    const csv = data.map((row) =>
      fields
        .map((field) => {
          const value = row[field];
          if (Array.isArray(value)) {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          } else if (typeof value === "object" && value !== null) {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          } else if (typeof value === "string") {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value !== undefined ? String(value) : "";
        })
        .join(",")
    );

    csv.unshift(fields.join(","));
    const csvStr = csv.join("\n");

    if (!fs.existsSync(`data/dataset/${EXPERIMENT_BATCH}`)) {
      fs.mkdirSync(`data/dataset/${EXPERIMENT_BATCH}`, { recursive: true });
    }

    fs.writeFileSync(`data/dataset/${EXPERIMENT_BATCH}/${name}.csv`, csvStr);
    console.log(`Exported collection ${name} to CSV`);
  }
  console.log("Exported all collections to CSV");
};

process.on("SIGTERM", function () {
  console.log("SIGTERM received, closing MongoDB connection");
  //mongoose.disconnect();
});

process.on("SIGINT", function () {
  console.log("SIGINT received, closing MongoDB connection");
  //mongoose.disconnect();
});
