import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const TIMEOUT_MS = 45000;
const MAX_ATTEMPTS = 2;

function isTemporaryError(error) {
  const message = String(error?.message || "").toLowerCase();
  const status = Number(error?.status || error?.code);

  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    message.includes("429") ||
    message.includes("500") ||
    message.includes("502") ||
    message.includes("503") ||
    message.includes("504") ||
    message.includes("timeout") ||
    message.includes("temporarily unavailable") ||
    message.includes("overloaded") ||
    message.includes("high demand")
  );
}

function createTimeoutError() {
  const error = new Error(
    "The AI request timed out after 45 seconds. Please try again."
  );

  error.code = "AI_TIMEOUT";
  return error;
}

async function generateWithTimeout(ai, prompt, config) {
  let timeoutId;

  try {
    return await Promise.race([
      ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config,
      }),

      new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(createTimeoutError());
        }, TIMEOUT_MS);
      }),
    ]);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function generateWithRetry(ai, prompt, config) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      console.log(
        `Gemini request started. Model: ${MODEL}. Attempt: ${attempt}`
      );

      const response = await generateWithTimeout(
        ai,
        prompt,
        config
      );

      console.log("Gemini response received successfully.");

      return response;
    } catch (error) {
      console.error(
        `Gemini attempt ${attempt} failed:`,
        error.message
      );

      if (
        error.code === "AI_TIMEOUT" ||
        !isTemporaryError(error) ||
        attempt === MAX_ATTEMPTS
      ) {
        throw error;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );
    }
  }

  throw new Error("AI analysis failed after retrying.");
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

Return only valid JSON matching the supplied schema.

Provide realistic and actionable analysis.
The startup score must be an integer from 0 to 100.
Include 3 to 5 potential competitors or comparable businesses.
Clearly distinguish potential competitors from verified research.
Do not invent exact market statistics.
Provide at least 3 items in each list.
Estimated cost must be an approximate MVP cost range in INR.
Return no Markdown or text outside the JSON.
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

    const parsed = JSON.parse(response.text);

    if (
      !Number.isInteger(parsed.startupScore) ||
      parsed.startupScore < 0 ||
      parsed.startupScore > 100
    ) {
      throw new Error("Gemini returned an invalid startup score.");
    }

    console.log("Startup analysis generated successfully.");

    return JSON.stringify(parsed);
  } catch (error) {
    console.error("Startup analysis failed:", error.message);

    if (error.code === "AI_TIMEOUT") {
      throw error;
    }

    if (isTemporaryError(error)) {
      throw new Error(
        "The AI service is temporarily busy. Please try again in a minute."
      );
    }

    throw error;
  }
}