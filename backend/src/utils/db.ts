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
        // Determine which delimiter is used in the line
        const delimiter = line.includes("----") ? "----" : "｜";
        const parts = line.split(delimiter);
        return {
          email: parts[0].trim(),
          password: parts[1].trim(),
          recovery: parts[2].trim(),
          recoveryCode: parts[3]?.trim(), // Optional recovery code
          countryCode: parts[4]?.trim() || "", // Optional country code
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
              chatBoxEnabled: true,
              warningMessageEnabled: false,
            });
          } else if (randNum < 0.2) {
            newAccount = await GAccount.create({
              email: account.email,
              password: account.password,
              recoveryEmail: account.recovery,
              type: "blank",
              batch: EXPERIMENT_BATCH,
              chatBoxEnabled: false,
              warningMessageEnabled: true,
            });
          } else {
            newAccount = await GAccount.create({
              email: account.email,
              password: account.password,
              recoveryEmail: account.recovery,
              type: "blank",
              batch: EXPERIMENT_BATCH,
              chatBoxEnabled: false,
              warningMessageEnabled: false,
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
            chatBoxEnabled: true,
            warningMessageEnabled: false,
          });
        } else if (randNum < 0.2) {
          newAccount = await GAccount.create({
            email: account.email,
            password: account.password,
            recoveryEmail: account.recovery,
            type: "blank",
            batch: EXPERIMENT_BATCH,
            chatBoxEnabled: false,
            warningMessageEnabled: true,
          });
        } else {
          newAccount = await GAccount.create({
            email: account.email,
            password: account.password,
            recoveryEmail: account.recovery,
            type: "blank",
            batch: EXPERIMENT_BATCH,
            chatBoxEnabled: false,
            warningMessageEnabled: false,
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
}

export const reuseAndReassignAccountsWithControl = async () => {
  console.log("Reusing and reassigning accounts into Experiment and Control groups...");

  try {
    console.log(`Fetching unused accounts from all previous batches`);

    // Fetch unused accounts from the previous batch
    const unusedAccounts = await GAccount.find({
      isAssigned: false,
      batch: { $ne: EXPERIMENT_BATCH },
    });

    console.log(`Found ${unusedAccounts.length} unused accounts to reuse.`);

    // Reassign each account to the current batch and categorize as Experiment or Control
    const reassignedPromises = unusedAccounts.map(async (account) => {
      account.batch = EXPERIMENT_BATCH;
      account.isControl = Math.random() < 0.2; // 20% chance to be Control
      account.chatBoxEnabled = false;
      account.warningMessageEnabled = false;
      account.isAssigned = false; // Ensure the account remains unassigned

      // Save the updated account
      await account.save();

      console.log(
        `Reused account: ${account.email} as ${account.isControl ? 'Control' : 'Experiment'}`
      );
    });

    // Await all reassignment operations
    await Promise.all(reassignedPromises);

    console.log("Successfully reused and reassigned accounts into Experiment and Control groups.");
  } catch (error) {
    console.error("Error while reusing and reassigning accounts:", error);
  }
};

export const markUnusedOldAccounts = async () => {
  console.log("Marking unused old accounts (not present in the TXT files) as 'unused-old-accounts'...");

  try {
    // List of TXT files to read from.
    const filePaths = [
      "data/accounts/accounts-7-300.txt",
      "data/accounts/accounts-7-500.txt",
      "data/accounts/accounts-7-1000.txt",
      "data/accounts/accounts-7-1800.txt",
      "data/accounts/accounts-7-2000.txt",
    ];

    // Read all files concurrently.
    // Note: No individual try/catch here so that any file read error will cause the entire Promise.all to reject.
    const emailArrays = await Promise.all(
      filePaths.map(async (filePath) => {
        const fileContent = await fsp.readFile(filePath, "utf-8");
        return fileContent
          .trim()
          .split("\n")
          .map((line) => {
            const parts = line.split("----");
            return parts[0].trim();
          })
          .filter((email) => email); // Remove any empty strings.
      })
    );

    // Flatten the arrays into a single array of emails and convert to a Set for fast lookup.
    const allEmails = emailArrays.flat();
    const validEmails = new Set(allEmails);
    console.log(`Total valid emails imported: ${validEmails.size}`);

    // Query for all accounts that are in the current experiment batch.
    const currentBatchAccounts = await GAccount.find({ batch: EXPERIMENT_BATCH });
    console.log(`Found ${currentBatchAccounts.length} accounts in the current batch.`);

    // Identify accounts whose email is NOT in the validEmails set.
    const accountsToMark = currentBatchAccounts.filter(
      (account) => !validEmails.has(account.email)
    );
    console.log(`Marking ${accountsToMark.length} account(s) as 'unused-old-accounts' because they're not in the TXT files.`);

    // Update each account.
    const updatePromises = accountsToMark.map(async (account) => {
      account.batch = "unused-old-accounts";
      await account.save();
      console.log(`Marked account ${account.email} as 'unused-old-accounts'.`);
    });
    await Promise.all(updatePromises);

    console.log("Successfully updated the batch for all non-listed accounts.");
  } catch (error) {
    console.error("Error marking unused old accounts:", error);
    // Halt the entire process if any error occurs (e.g. reading a file)
    process.exit(1);
  }
};


export const validateGmailAccounts = async (checkFilePath: string) => {
  try {
    console.log("Validating Gmail accounts...");
    // Read the check file content
    const fileContent = await fsp.readFile(checkFilePath, "utf-8");

    // Split the file into lines and map each line into a status/email pair
    const validations = fileContent
      .trim()
      .split("\n")
      .map((line) => {
        const [status, email] = line.split("|").map((s) => s.trim());
        return { status, email };
      });

    // Process each validation entry
    await Promise.all(
      validations.map(async (entry) => {
        if (entry.status.toLowerCase() !== "live") {
          // Remove the account only if it's unassigned (isAssigned is false)
          const result = await GAccount.deleteOne({ email: entry.email, isAssigned: false });
          if (result.deletedCount && result.deletedCount > 0) {
            console.log(`Removed unassigned account: ${entry.email}`);
          } else {
            console.log(`Account ${entry.email} not found, already removed, or assigned.`);
          }
        }
      })
    );
    console.log("Gmail account validation complete.");
  } catch (err) {
    console.error("Error validating Gmail accounts:", err);
  }
};



export const rollbackOldAccounts = async () => {
  console.log("Rolling back 'unused-old-accounts' to 'main-1'...");

  try {
    // Find all accounts with the batch "unused-old-accounts".
    const accounts = await GAccount.find({ batch: "unused-old-accounts" });
    console.log(`Found ${accounts.length} accounts to roll back.`);

    // Update each account's batch to "main-1".
    const updatePromises = accounts.map(async (account) => {
      account.batch = "main-1";
      await account.save();
      console.log(`Rolled back account ${account.email} to 'main-1'.`);
    });
    await Promise.all(updatePromises);
    console.log("Rollback successful. All 'unused-old-accounts' have been set to 'main-1'.");
  } catch (error) {
    console.error("Error during rollback:", error);
  }
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
