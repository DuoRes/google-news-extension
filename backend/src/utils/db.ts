import mongoose from "mongoose";
import debug from "debug";
import Config from "../config";
const dbDebugger = debug("app:db");

// Switching to test database
// NODE_ENV=test node index.js
// Db Work: dbDebugger('')

export const connectDB = async () => {
  var db: any;
  if (process.env.NODE_ENV === "test") {
    dbDebugger("Using local test database");
    db = Config.mongoDbUri;
  } else if (process.env.NODE_ENV === "production") {
    db = process.env.DB;
  } else {
    dbDebugger("NODE_ENV not set, using local database");
    db = "mongodb://localhost:27017/DryHuo-Dev";
  }

  console.log("Connecting to MongoDB...");
  await mongoose
    .connect(db)
    .then(() => {
      console.log("Connected to MongoDB...");
      dbDebugger(`Connect to ${db}...`);
    })
    .catch((err: any) => console.log(err));
};

process.on("SIGTERM", function () {
  console.log("SIGTERM received, closing MongoDB connection");
  //mongoose.disconnect();
});

process.on("SIGINT", function () {
  console.log("SIGINT received, closing MongoDB connection");
  //mongoose.disconnect();
});
