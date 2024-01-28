import express, { application } from "express";
import Config from "./config";
import { connectDB } from "./utils/db";

// Link Routes
import collector from "./routes/collector";
import user from "./routes/user";
import chat from "./routes/chat";

(async () => connectDB())();

// Startup Express and Connect MongoDB
const app = express();
app.use(express.json());
app.use(express.static(__dirname));
app.get("/", (req, res) => {
  res.send("Hello from Mingduo!");
});

// Use Routes
app.use("/collect", collector);
app.use("/user", user);
app.use("/chat", chat);

export default app;
