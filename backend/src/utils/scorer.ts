import OpenAI from "openai";
import Config from "../config";

const openai = new OpenAI({ apiKey: Config.openaiApiKey });

export async function ratePoliticalStance(
  pressFreqencyMap: string
): Promise<number> {
  const prompt = `Based on the frequency of the following presses that appears on the user's news feed selection, please analyze and score the current news page's political stance:\n\n${pressFreqencyMap}\n\nScore from -100 to 100, where -100 indicates extremely left-leaning views, 0 is neutral, and 100 indicates extremely right-leaning views. Please provide a score for the current news page's political stance:`;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      max_tokens: 100,
      messages: [
        {
          role: "system",
          content: prompt,
        },
      ],
      functions: [
        {
          name: "publishPoliticalStanceRating",
          description:
            "Rates the political stance of the user based on the press frequency of each News Press the user selects.",
          parameters: {
            type: "object",
            properties: {
              politicalStanceRating: {
                type: "number",
                description:
                  "The political stance rating of the user based on the press frequency map.",
              },
            },
            required: ["politicalStanceRating"],
          },
        },
      ],
      function_call: {
        name: "publishPoliticalStanceRating",
      },
    });

    const completion = response.choices[0].message.function_call.arguments;

    const parsedCompletion = JSON.parse(completion);

    console.log(parsedCompletion);
    console.log(parsedCompletion.politicalStanceRating);

    return parsedCompletion.politicalStanceRating;
  } catch (err) {
    console.trace(err);
  }
}
