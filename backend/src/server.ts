import express from "express";
import { connectDB } from "./utils/db";
import cors from "cors";

// Link Routes
import collector from "./routes/collector";
import user from "./routes/user";
import chat from "./routes/chat";

(async () => connectDB())();

// Startup Express and Connect MongoDB
const app = express();
app.use(express.static(__dirname));
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb" }));
app.use(cors());
app.get("/", (req, res) => {
  res.send("Hello from Mingduo!");
});

// Use Routes
app.use("/collect", collector);
app.use("/user", user);
app.use("/chat", chat);

export default app;
