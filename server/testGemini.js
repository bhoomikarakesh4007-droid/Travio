import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const modelsToTest = [
  "gemini-2.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite"
];

for (const modelName of modelsToTest) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    console.log(`Testing model: ${modelName}`);
    const result = await model.generateContent("Hello! Respond with 'Yes' if you can read this.");
    console.log(`Response for ${modelName}:`, result.response.text().trim());
  } catch (err) {
    console.error(`Error with ${modelName}:`, err.message || err);
  }
}

