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
//   await importAccountsFromTXT("data/accounts/accounts-6.txt");
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
