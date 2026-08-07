import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

export async function analyzeStartup(data) {
  if (!data) {
    throw new Error("Startup data was not received.");
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const prompt = `
You are an expert startup consultant.

Analyze the following startup idea.

Startup Name: ${data.startupName}
Idea: ${data.idea}
Industry: ${data.industry}
Target Audience: ${data.audience}
Business Model: ${data.model}

Return ONLY valid JSON in exactly this structure:

{
  "startupScore": 0,
  "marketPotential": "",
  "competition": "",
  "estimatedCost": "",
  "strengths": [],
  "weaknesses": [],
  "suggestions": []
}

Rules:
- startupScore must be between 0 and 100.
- Give useful and realistic startup analysis.
- strengths must contain at least 3 points.
- weaknesses must contain at least 3 points.
- suggestions must contain at least 3 points.
- Do not use Markdown.
- Do not use code fences.
- Return only JSON.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });

  return response.text;
}