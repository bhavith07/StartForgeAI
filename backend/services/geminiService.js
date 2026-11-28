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
You are a pragmatic technology startup guide helping a founder plan a real commercial technology startup.

Startup name: ${data.startupName}
Idea and problem: ${data.idea}
Industry: ${data.industry}
Target users: ${data.audience}
Business model: ${data.model}
Planned launch location: ${data.launchLocation}

Create one cohesive technology startup assessment, not separate overlapping generic and competitor analyses.
The startup score must be an integer from 0 to 100 and is a directional rubric, not a validated prediction.
Give concrete, feasible recommendations for a commercial launch. Keep the initial architecture practical and explain what can be deferred until traction.
Estimate a real commercial launch budget in INR for the specific startup in ${data.launchLocation}, not a student project. Separate one-time setup and product development costs from monthly operating costs. Include locally relevant categories based on the idea (such as workspace only if required, equipment, commercially realistic staffing, connectivity, registration, hosting, marketing and operations). State team size, scope, timeframe and assumptions behind each range. Label all values as directional estimates rather than verified quotes, and do not invent exact current local prices or claim current price research.
Do not invent market-size figures, adoption numbers, pricing, customer counts, technical benchmarks, citations, source URLs, or claims of live research.
Competitors must be plausible candidates or alternatives only. For each, describe the likely offering and possible strengths/weaknesses, but set evidenceStatus to "Unverified AI-generated candidate" and sourceUrls to an empty array. Say clearly that this assessment did not perform live competitor research. Put differentiation ideas in this same competitor research section.
Identify assumptions and validation steps explicitly. Mention security, privacy, scalability, and implementation risks. Keep recommendations neutral and useful for a commercially viable launch.
Return only valid JSON matching the supplied schema. Return no Markdown or text outside the JSON.
`;

  const stringList = { type: "ARRAY", items: { type: "STRING" } };
  const objectList = (properties, required) => ({
    type: "ARRAY",
    items: { type: "OBJECT", properties, required },
  });
  const schema = {
    type: "OBJECT",
    properties: {
      startupScore: { type: "INTEGER" },
      marketPotential: { type: "STRING" },
      targetMarket: { type: "STRING" },
      growthPotential: { type: "STRING" },
      estimatedCost: { type: "STRING" },
      strengths: stringList,
      weaknesses: stringList,
      suggestions: stringList,
      founderGuide: {
        type: "OBJECT",
        properties: {
          problemUseCase: { type: "STRING" },
          targetUsers: { type: "STRING" },
          technicalSolution: {
            type: "OBJECT",
            properties: {
              overview: { type: "STRING" },
              architectureComponents: objectList(
                { component: { type: "STRING" }, responsibility: { type: "STRING" } },
                ["component", "responsibility"]
              ),
            },
            required: ["overview", "architectureComponents"],
          },
          coreMvpFeatures: stringList,
          recommendedTechStack: objectList(
            { layer: { type: "STRING" }, recommendation: { type: "STRING" }, reason: { type: "STRING" } },
            ["layer", "recommendation", "reason"]
          ),
          developmentPhases: objectList(
            { phase: { type: "STRING" }, duration: { type: "STRING" }, deliverables: stringList },
            ["phase", "duration", "deliverables"]
          ),
          costEstimates: {
            type: "OBJECT",
            properties: {
              currency: { type: "STRING" },
              developmentRange: { type: "STRING" },
              developmentAssumptions: stringList,
              monthlyOperatingCosts: objectList(
                { category: { type: "STRING" }, range: { type: "STRING" }, assumption: { type: "STRING" } },
                ["category", "range", "assumption"]
              ),
            },
            required: ["currency", "developmentRange", "developmentAssumptions", "monthlyOperatingCosts"],
          },
          risks: objectList(
            { risk: { type: "STRING" }, severity: { type: "STRING" }, mitigation: { type: "STRING" } },
            ["risk", "severity", "mitigation"]
          ),
          marketPotential: {
            type: "OBJECT",
            properties: { opportunity: { type: "STRING" }, assumptions: stringList, validationSteps: stringList },
            required: ["opportunity", "assumptions", "validationSteps"],
          },
          competitorResearch: {
            type: "OBJECT",
            properties: {
              evidenceStatus: { type: "STRING" },
              limitation: { type: "STRING" },
              candidates: objectList(
                {
                  name: { type: "STRING" },
                  offering: { type: "STRING" },
                  targetUsers: { type: "STRING" },
                  strengths: stringList,
                  weaknesses: stringList,
                  differentiationOpportunities: stringList,
                  evidenceStatus: { type: "STRING" },
                  sourceUrls: stringList,
                },
                ["name", "offering", "targetUsers", "strengths", "weaknesses", "differentiationOpportunities", "evidenceStatus", "sourceUrls"]
              ),
              followUp: { type: "STRING" },
            },
            required: ["evidenceStatus", "limitation", "candidates", "followUp"],
          },
          assumptions: stringList,
        },
        required: ["problemUseCase", "targetUsers", "technicalSolution", "coreMvpFeatures", "recommendedTechStack", "developmentPhases", "costEstimates", "risks", "marketPotential", "competitorResearch", "assumptions"],
      },
    },
    required: ["startupScore", "marketPotential", "targetMarket", "growthPotential", "estimatedCost", "strengths", "weaknesses", "suggestions", "founderGuide"],
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

    if (!parsed.founderGuide || !parsed.founderGuide.competitorResearch) {
      throw new Error("Gemini returned an incomplete technology startup guide.");
    }
    parsed.founderGuide.competitorResearch.evidenceStatus = "Unverified AI-generated candidates; no live research was performed.";
    parsed.founderGuide.competitorResearch.candidates = (parsed.founderGuide.competitorResearch.candidates || []).map((candidate) => ({
      ...candidate,
      evidenceStatus: "Unverified AI-generated candidate",
      sourceUrls: [],
    }));

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
