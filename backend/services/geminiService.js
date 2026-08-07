import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function analyzeStartup(data) {
  const prompt = `
You are an expert startup consultant.

Analyze the following startup idea and return ONLY valid JSON.

Startup Name: ${data.startupName}
Idea: ${data.idea}
Industry: ${data.industry}
Target Audience: ${data.audience}
Business Model: ${data.model}

Return JSON in this exact format:

{
  "startupScore": number,
  "marketPotential": "",
  "competition": "",
  "estimatedCost": "",
  "strengths": [],
  "weaknesses": [],
  "suggestions": []
}

Do not include markdown.
Do not include explanation.
Return only JSON.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text;
}