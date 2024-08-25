import app from "./server";
import Config from "./config";

/********** Import New Accounts for Batch ************/
// Importing accounts from a JSON file
// import accounts from "../../data/accounts/accounts-3.json"; // change this for loading
// import { importAccountsFromJSON } from "./utils/db";
// (async () => {
//   await importAccounts(accounts);
// })();

// Importing accounts from a TXT file
// import { importAccountsFromTXT } from "./utils/db";
// (async () => {
//   await importAccountsFromTXT("data/accounts/accounts-4.txt");
// })();

/************* Reuse Unassigned Accounts *************/
// import { reuseUnusedAccountsFromPreviousBatch } from "./utils/db";
// (async () => {
//   await reuseUnusedAccountsFromPreviousBatch();
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
