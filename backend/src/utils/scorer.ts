import axios from "axios";
import { isArray, isObject } from "lodash";
import Config from "../config";

axios.defaults.headers.common[
  "Authorization"
] = `Bearer ${Config.openaiApiKey}`;

async function chat(prompt: string): Promise<any> {
  while (true) {
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/engines/gpt-4/completions",
        {
          model: "gpt-4",
          messages: [{ role: "system", content: prompt }],
        }
      );

      const result = response.data.choices[0].message.content;
      // Extract the JSON from the result
      const extractJson = (inputString: string): string | null => {
        let stack = [];
        let jsonStartPositions = [];

        for (let pos = 0; pos < inputString.length; pos++) {
          const char = inputString[pos];
          if (char === "{" || char === "[") {
            stack.push(char);
            if (stack.length === 1) {
              jsonStartPositions.push(pos);
            }
          } else if (char === "}" || char === "]") {
            if (stack.length === 0) {
              throw new Error(`unexpected ${char} at position ${pos}`);
            }
            const lastOpen = stack.pop();
            if (
              (lastOpen === "{" && char !== "}") ||
              (lastOpen === "[" && char !== "]")
            ) {
              throw new Error(
                `mismatched brackets ${lastOpen} and ${char} at position ${pos}`
              );
            }
            if (stack.length === 0) {
              return inputString.substring(jsonStartPositions.pop()!, pos + 1);
            }
          }
        }
        return null;
      };

      let jsonResult = extractJson(result);
      if (jsonResult) {
        return JSON.parse(jsonResult);
      }
      return null;
    } catch (error) {
      console.error(error);
      console.log("------------------------!Error!------------------------");
      console.log("-------------------------------------------------------");
      continue;
    }
  }
}

// Deprecated
const allCategories = [
  "World",
  "Business",
  "Technology",
  "Entertainment",
  "Sports",
  "Science",
  "Health",
];

interface Article {
  title: string;
  media: string;
}

function buildChosenArticlesString(chosenArticles: Article[]): string {
  let chosenArticlesString = "The user has chosen the following articles:\n";
  chosenArticles.forEach((article, index) => {
    chosenArticlesString += `${index + 1}. ${article.title}, by ${
      article.media
    }\n`;
  });
  return chosenArticlesString;
}

async function generatePersonalityTraits(
  chosenArticlesString: string
): Promise<{ [key: string]: number }> {
  const prompt = `I want you analyze a news reader's 5 personality traits based on the reader's chosen articles.\nChosen articles:\n${chosenArticlesString}\n... (rest of the prompt)`;
  while (true) {
    try {
      const response: { [key: string]: number } = await chat(prompt);
      if (isObject(response)) {
        return response;
      } else {
        console.log("------------------Invalid Response------------------");
        console.log("Response invalid. Trying again...");
      }
    } catch (e) {
      console.error("------------------Error Occurred------------------");
      console.error(e);
      console.log("Response invalid. Trying again...");
    }
  }
}

async function generatePreference(
  chosenArticlesString: string
): Promise<{ [key: string]: number }> {
  const prompt = `I want you to analyze a news reader's Breadth of Interests, Depth of Interest, ... (rest of the prompt)\n${chosenArticlesString}`;
  while (true) {
    try {
      const response: { [key: string]: number } = await chat(prompt);
      if (isObject(response)) {
        return response;
      } else {
        console.log("------------------Invalid Response------------------");
        console.log("Response invalid. Trying again...");
      }
    } catch (e) {
      console.error("------------------Error Occurred------------------");
      console.error(e);
      console.log("Response invalid. Trying again...");
    }
  }
}

async function generatePoliticalCultural(
  chosenArticlesString: string
): Promise<{ [key: string]: number }> {
  const prompt = `I want you to analyze a news reader's political, cultural ideology and social political engagement based on the reader's chosen articles.\n${chosenArticlesString}\n... (rest of the prompt)`;
  while (true) {
    try {
      const response: { [key: string]: number } = await chat(prompt);
      if (isObject(response)) {
        return response;
      } else {
        console.log("------------------Invalid Response------------------");
        console.log("Response invalid. Trying again...");
      }
    } catch (e) {
      console.error("------------------Error Occurred------------------");
      console.error(e);
      console.log("Response invalid. Trying again...");
    }
  }
}

async function generateCareerIndustryFocus(
  chosenArticlesString: string
): Promise<{ [key: string]: number }> {
  const prompt = `I want you to analyze a news reader's level of industry focus based on the reader's chosen articles.\n${chosenArticlesString}\n... (rest of the prompt)`;
  while (true) {
    try {
      const response: { [key: string]: number } = await chat(prompt);
      if (isObject(response)) {
        return response;
      } else {
        console.log("------------------Invalid Response------------------");
        console.log("Response invalid. Trying again...");
      }
    } catch (e) {
      console.error("------------------Error Occurred------------------");
      console.error(e);
      console.log("Response invalid. Trying again...");
    }
  }
}
