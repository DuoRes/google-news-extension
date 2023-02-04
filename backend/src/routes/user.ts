import moment from "moment";
import express from "express";
import Content from "../models/Content";
import User from "../models/User";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const user = await User.create({
      email: req.body.email,
      name: req.body.name,
    });
    return res.status(201).json(user);
  } catch (err) {
    return res.status(400).send("Error creating new user: " + err);
  }
});

export default router;
