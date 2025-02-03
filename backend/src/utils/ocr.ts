import Tesseract from "tesseract.js";

export const allowedMimeTypes = ["image/jpeg", "image/png"];

export async function extractGoogleEmail(
  imagePath: string,
  email: string
): Promise<[string, number]> {
  try {
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
  } catch (error) {
    console.error('Error in extractGoogleEmail:', error);
    return ["", 0];
  }
}
