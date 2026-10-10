import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const MODEL =
  process.env.GEMINI_MODEL || "gemini-3.8-flash";

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function isTemporaryError(error) {
  const message = String(error?.message || "").toLowerCase();

  return (
    message.includes("503") ||
    message.includes("unavailable") ||
    message.includes("overloaded") ||
    message.includes("429") ||
    message.includes("500") ||
    message.includes("internal server error")
  );
}

async function generateWithRetry(ai, prompt, config) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config,
      });
    } catch (error) {
      if (!isTemporaryError(error) || attempt === maxAttempts) {
        throw error;
      }

      const delay = 1000 * 2 ** (attempt - 1);

      console.log(
        `Gemini temporarily unavailable. Retry ${attempt + 1}/${maxAttempts} in ${delay}ms.`
      );

      await sleep(delay);
    }
  }
}

export async function analyzeStartup(data) {
  if (!data) {
    throw new Error("Startup data was not received.");
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing from .env");
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const prompt = `
You are an experienced startup consultant.

Analyze this startup idea realistically.

Startup Name: ${data.startupName}
Idea: ${data.idea}
Industry: ${data.industry}
Target Audience: ${data.audience}
Business Model: ${data.model}

Return only valid JSON with this structure:

{
  "startupScore": 0,
  "marketPotential": "",
  "targetMarket": "",
  "growthPotential": "",
  "competition": "",
  "estimatedCost": "",
  "marketChallenges": [],
  "competitors": [
    {
      "name": "",
      "description": "",
      "strength": "",
      "weakness": ""
    }
  ],
  "competitorStrengths": [],
  "competitorWeaknesses": [],
  "differentiationOpportunities": [],
  "strengths": [],
  "weaknesses": [],
  "suggestions": []
}

Rules:
- Score must be an integer from 0 to 100.
- Provide realistic, actionable analysis.
- Include 3 to 5 potential competitors or comparable businesses.
- Clearly distinguish potential competitors from verified research.
- Do not invent exact market statistics.
- Provide at least 3 items in each list.
- Estimated cost should be an approximate MVP cost range in INR.
- Return no Markdown or text outside the JSON.
`;

  const schema = {
    type: "OBJECT",
    properties: {
      startupScore: { type: "INTEGER" },
      marketPotential: { type: "STRING" },
      targetMarket: { type: "STRING" },
      growthPotential: { type: "STRING" },
      competition: { type: "STRING" },
      estimatedCost: { type: "STRING" },

      marketChallenges: {
        type: "ARRAY",
        items: { type: "STRING" },
      },

      competitors: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING" },
            description: { type: "STRING" },
            strength: { type: "STRING" },
            weakness: { type: "STRING" },
          },
          required: [
            "name",
            "description",
            "strength",
            "weakness",
          ],
        },
      },

      competitorStrengths: {
        type: "ARRAY",
        items: { type: "STRING" },
      },

      competitorWeaknesses: {
        type: "ARRAY",
        items: { type: "STRING" },
      },

      differentiationOpportunities: {
        type: "ARRAY",
        items: { type: "STRING" },
      },

      strengths: {
        type: "ARRAY",
        items: { type: "STRING" },
      },

      weaknesses: {
        type: "ARRAY",
        items: { type: "STRING" },
      },

      suggestions: {
        type: "ARRAY",
        items: { type: "STRING" },
      },
    },

    required: [
      "startupScore",
      "marketPotential",
      "targetMarket",
      "growthPotential",
      "competition",
      "estimatedCost",
      "marketChallenges",
      "competitors",
      "competitorStrengths",
      "competitorWeaknesses",
      "differentiationOpportunities",
      "strengths",
      "weaknesses",
      "suggestions",
    ],
  };

  try {
    const response = await generateWithRetry(ai, prompt, {
      responseMimeType: "application/json",
      responseSchema: schema,
    });

    if (!response.text) {
      throw new Error("Gemini returned an empty response.");
    }

    // Verify that the generated response is valid JSON.
    const parsed = JSON.parse(response.text);

    if (
      !Number.isInteger(parsed.startupScore) ||
      parsed.startupScore < 0 ||
      parsed.startupScore > 100
    ) {
      throw new Error("Gemini returned an invalid startup score.");
    }

    return JSON.stringify(parsed);
  } catch (error) {
    console.error("Gemini analysis failed:", error.message);

    if (isTemporaryError(error)) {
      throw new Error(
        "The AI service is temporarily busy. Please try again in a minute."
      );
    }

    throw error;
  }
}
