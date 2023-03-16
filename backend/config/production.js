require("dotenv/config");

module.exports = {
  name: "chrome-extension-production",
  db: process.env.MONGODB_URI,
};
