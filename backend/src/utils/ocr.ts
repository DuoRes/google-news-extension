import Tesseract from "tesseract.js";
import fs from "fs";
import path from "path";

export async function extractGoogleEmail(
  imagePath: string,
  email: string
): Promise<[string, number]> {
  // Extract the username from the given email
  const username = email.split("@gmail.com")[0];

  // Initialize variables to store extracted email and its confidence
  let extractedEmail = "";
  let confidence = 0;

  // Perform OCR on the image
  const {
    data: { text },
  } = await Tesseract.recognize(imagePath, "eng");

  // Search for the email pattern in the recognized text
  const potentialEmails = text.match(/[\w.-]+@gmail/g);
  if (potentialEmails) {
    potentialEmails.forEach((potentialEmail) => {
      const extractedUsername = potentialEmail.split("@")[0];

      // Calculate the match confidence
      const match = extractedUsername
        .split("")
        .reduce((acc, char, i) => acc + (char === username[i] ? 1 : 0), 0);
      const currentConfidence = (match / username.length) * 100;

      // Update if the current confidence is higher than the previous ones
      if (currentConfidence > confidence) {
        extractedEmail = extractedUsername;
        confidence = currentConfidence;
      }
    });
  }

  return [extractedEmail, confidence];
}

async function main() {
  const data = JSON.parse(fs.readFileSync("actual.json", "utf8"));

  const results = [];

  for (const imgInfo of data) {
    const imgId = imgInfo["id"];
    console.log("Processing image: ", imgId);
    const imgPath = path.join("img", imgId + ".png");
    const email = imgInfo["account"];
    const [extractedEmail, confidence] = await extractGoogleEmail(
      imgPath,
      email
    );
    results.push({
      id: imgId,
      email: email.split("@")[0],
      extracted_email: extractedEmail,
      confidence: confidence,
    });
  }

  fs.writeFileSync("result.json", JSON.stringify(results, null, 4));
}

main().catch(console.error);
