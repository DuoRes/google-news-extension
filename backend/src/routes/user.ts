import moment from "moment";
import express from "express";
import Content from "../models/Content";
import User from "../models/User";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const token = req.body.token;
    const user = await User.findOne({ token });
    if (!user) {
      const newUser = await User.create({ token });
      return res.send(newUser);
    }
    console.log("user", user);
    return res.send(user);
  } catch (error) {
    console.trace(error);
    return res.status(500).send(error);
  }
});

export default router;
