import User from "../models/User";
import Content from "../models/Content";
import Recommendation from "../models/Recommendation";
import { ObjectId } from "mongodb";
import { count } from "console";

const MINIMUM_CLICKS_REQUIRED = 20;
const MINIMUM_PAUSE_BETWEEN_CLICKS = 1000 * 5; // 5 seconds
const MINIMUM_TOTAL_TIME = 1000 * 60 * 7; // 7 minutes

interface ClickStats {
  count: number;
  totalDuration: number; // in milliseconds
  isCompleted: boolean;
}

/**
 * Retrieves click statistics for a user.
 * @param user_id - The ID of the user.
 * @returns An object containing the count of valid clicks, total duration, and completion status.
 */
export const getClickStats = async (
  user_id: ObjectId | string
): Promise<ClickStats> => {
  const user = await User.findById(user_id);
  if (!user) {
    return { count: 0, totalDuration: 0, isCompleted: false };
  }

  // Fetch clicked contents sorted by timestamp in ascending order
  // const contents = await Content.find({ user: user._id, clicked: true })
  //   .sort({ timestamp: 1 })
  //   .exec();
  const contents = await Recommendation.find({ user: user._id }).sort({ timestamp: 1 }).exec();

  let count = 0;
  let lastClickTime = 0;
  let firstClickTime = 0;

  for (const content of contents) {
    const currentClickTime = content.timestamp.getTime();

    if (count === 0) {
      // Initialize with the first valid click
      firstClickTime = currentClickTime;
      count++;
      lastClickTime = currentClickTime;
    } else {
      // Check if the current click is at least MINIMUM_PAUSE_BETWEEN_CLICKS after the last valid click
      if (currentClickTime - lastClickTime >= MINIMUM_PAUSE_BETWEEN_CLICKS) {
        count++;
        lastClickTime = currentClickTime;
      }
    }
  }

  if (count === 0) {
    return { count: 0, totalDuration: 0, isCompleted: false };
  }

  const totalDuration = lastClickTime - firstClickTime;

  // Determine completion status based on both count and total duration
  const isCompleted =
    count >= MINIMUM_CLICKS_REQUIRED && totalDuration >= MINIMUM_TOTAL_TIME;

  return { count, totalDuration, isCompleted };
};
