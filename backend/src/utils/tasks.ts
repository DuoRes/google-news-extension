import User from "../models/user";
import Content from "../models/content";
import { ObjectId } from "mongodb";

const MINIMUM_PAUSE_BETWEEN_CLICKS = 1000 * 5; // 5 seconds

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
