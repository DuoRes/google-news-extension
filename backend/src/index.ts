import app from "./server";
import Config from "./config";

/********** Import New Accounts from a JSON file ************/
// Importing accounts from a JSON file
// import accounts from "../../data/accounts/accounts-3.json"; // change this for loading
// import { importAccountsFromJSON } from "./utils/db";
// (async () => {
//   await importAccounts(accounts);
// })();

/********** Import New Accounts from a TXT file **********/
// import { importAccountsFromTXT } from "./utils/db";
// (async () => {
//   await importAccountsFromTXT("data/accounts/accounts-7-50.txt");
// })();

/************* Reuse Unused Accounts *************/
// import { reuseUnusedAccountsFromPreviousBatch } from "./utils/db";
// (async () => {
//   await reuseUnusedAccountsFromPreviousBatch();
// })();

/******* Reuse and reassign unused account ***********/
// import { reuseAndReassignAccountsWithControl } from "./utils/db";
// (async () => {
//   await reuseAndReassignAccountsWithControl();
// })();

/************** Export All Data to CSV ***************/
// import { exportAllToCSV } from "./utils/db";
// (async () => {
//   await exportAllToCSV();
// })();


/******* Mark unused old accounts ***********/
// import { markUnusedOldAccounts } from "./utils/db";
// (async () => {
//   try {
//     await markUnusedOldAccounts();
//     console.log("Unused old accounts have been marked successfully.");
//   } catch (error) {
//     console.error("Error marking unused old accounts:", error);
//   }
// })();

/******* Roll back unused old accounts ***********/
// import { rollbackOldAccounts } from "./utils/db";
// (async () => {
//   try {
//     await rollbackOldAccounts();
//     console.log("Rollback completed successfully.");
//   } catch (error) {
//     console.error("Error during rollback:", error);
//   }
// })();

// import { validateGmailAccounts } from "./utils/db";
// (async () => {
//   try {
//     await validateGmailAccounts("data/gmail_check.txt");
//     console.log("Validation completed successfully.");
//   } catch (error) {
//     console.error("Error during validation:", error);
//   }
// })();

const port = Config.port || 6000;
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

// Add graceful shutdown
process.on("SIGTERM", function () {
  server.close();
});

process.on("SIGINT", function () {
  server.close();
});
