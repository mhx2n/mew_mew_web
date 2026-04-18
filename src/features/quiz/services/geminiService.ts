import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from "../../../types";

let ai: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateQuizFromText(text: string, count: number = 5, retries: number = 3): Promise<Omit<QuizQuestion, 'id' | 'status'>[]> {
  const aiClient = getAI();
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await aiClient.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: `You are an expert quiz creator. Extract exactly ${count} multiple-choice questions from the provided text. 
The text may be unstructured, in different languages (including Bengali), messy, or in CSV format. 
If the input is CSV, map the options and the correct answer properly (note that CSV answers might be 1-indexed, e.g., 1, 2, 3, 4, but you MUST output a 0-indexed correctOptionIndex, e.g., 0, 1, 2, 3).
Identify key facts and convert them into a quiz format. 
Ensure each question has exactly 4 options. 
CRITICAL: Keep questions under 250 characters and options under 90 characters to comply with Telegram's limits.
The output must be in the language of the input text.

Text to process:
${text}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { 
                  type: Type.STRING,
                  description: "The quiz question. Max 250 characters."
                },
                options: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "Exactly 4 options for the multiple choice question. Max 90 characters per option."
                },
                correctOptionIndex: { 
                  type: Type.INTEGER,
                  description: "The index of the correct option (0 to 3). If the source says answer is 4, this should be 3."
                },
                explanation: { 
                  type: Type.STRING,
                  description: "A short explanation of why the answer is correct. Max 150 characters."
                }
              },
              required: ["question", "options", "correctOptionIndex", "explanation"]
            }
          }
        }
      });

      if (!response.text) {
        throw new Error("Failed to generate content");
      }

      let jsonStr = response.text.trim();
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.replace(/^```json\n/, "").replace(/\n```$/, "");
      } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```\n/, "").replace(/\n```$/, "");
      }

      try {
        return JSON.parse(jsonStr);
      } catch (e) {
        console.error("Failed to parse JSON:", jsonStr);
        throw new Error("Failed to parse the generated quiz. Please try again.");
      }
    } catch (error: any) {
      const isRateLimit = error?.message?.includes('429') || error?.status === 429 || error?.message?.includes('Quota exceeded');
      
      if (isRateLimit && attempt < retries) {
        // Exponential backoff: 2s, 4s, 8s
        const waitTime = Math.pow(2, attempt) * 2000;
        console.warn(`Rate limit hit. Retrying in ${waitTime/1000}s... (Attempt ${attempt + 1} of ${retries})`);
        await delay(waitTime);
        continue;
      }
      
      throw error;
    }
  }
  
  throw new Error("Failed to generate quiz after multiple attempts due to server limits.");
}
