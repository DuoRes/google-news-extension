import app from "./server";
import Config from "./config";

// import { importAccounts } from "./utils/db";

// (async () => {
//   await importAccounts("pilot-0");
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
