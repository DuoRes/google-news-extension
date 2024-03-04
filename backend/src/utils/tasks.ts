import User from "../models/User";
import Content from "../models/Content";
import { ObjectId } from "mongodb";
import { count } from "console";

const MINIMUM_CLICKS_REQUIRED = 30;
const MINIMUM_PAUSE_BETWEEN_CLICKS = 1000 * 5; // 5 seconds
const MINIMUM_TOTAL_TIME = 1000 * 60 * 10; // 10 minutes

// count the number of clicks on the content for the user, each click should be spaced out by at least 5 seconds
export const countValidClicks = async (user_id: ObjectId | string) => {
  const user = await User.findById(user_id);
  if (!user) {
    return 0;
  }
  const contents = await Content.find({ user: user._id });
  let count = 0;
  let lastClickTime = 0;
  contents.forEach((content) => {
    if (content.clicked) {
      if (
        content.timestamp.getTime() - lastClickTime >
        MINIMUM_PAUSE_BETWEEN_CLICKS
      ) {
        count++;
        lastClickTime = content.timestamp.getTime();
      }
    }
  });
  return count;
};

// check if the user has spent at least 10 minutes on the site and at least 30 clicks in total
export const isCompleted = async (user_id: ObjectId | string) => {
  const user = await User.findById(user_id);
  if (!user) {
    return 0;
  }
  const contents = await Content.find({ user: user._id });
  let count = 0;
  let lastClickTime = 0;
  contents.forEach((content) => {
    if (content.clicked) {
      if (
        content.timestamp.getTime() - lastClickTime >
        MINIMUM_PAUSE_BETWEEN_CLICKS
      ) {
        count++;
        lastClickTime = content.timestamp.getTime();
      }
    }
  });
  const totalTime =
    contents[contents.length - 1].timestamp.getTime() -
    contents[0].timestamp.getTime();

  return count >= MINIMUM_CLICKS_REQUIRED && totalTime >= MINIMUM_TOTAL_TIME;
};
