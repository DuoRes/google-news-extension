import express, { application } from "express";
import Config from "./config";
import { connectDB } from "./utils/db";

// Link Routes
import collector from "./routes/collection";

console.log("before connectDB");
(async () => connectDB())();
console.log("after connectDB");

// Startup Express and Connect MongoDB
const app = express();
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello from Mingduo!");
});

// Use Routes
app.use("/collect", collector);

export default app;
