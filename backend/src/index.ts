import app from "./server";
import Config from "./config";

/********** Import New Accounts for Batch ************/
// import { importAccounts } from "./utils/db";
// (async () => {
//   await importAccounts();
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
