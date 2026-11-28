import { GoogleGenAI } from "@google/genai";

const MODEL = process.env.GEMINI_INDUSTRY_RESEARCH_MODEL || "gemini-3.8-flash";
const MAX_COMPETITORS = 12;

function httpError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function extractJson(text) {
  const cleaned = String(text || "").trim().replace(/^\`\`\`(?:json)?\s*/i, "").replace(/\s*\`\`\`$/, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw httpError("Research provider returned an unreadable response. Please try again.", 502);
  return JSON.parse(cleaned.slice(start, end + 1));
}

function normalizeUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function researchIndustryCompetitors({ idea, industry, targetMarket }) {
  if (!process.env.GEMINI_API_KEY) throw httpError("GEMINI_API_KEY is missing from backend/.env.", 500);
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `
Research competitors for a startup founder. Use Google Search grounding when available and cite verifiable sources. If live search is unavailable, provide only clearly labelled unverified candidates and do not invent citations or official URLs.
Startup idea: ${idea}
Industry/category: ${industry}
Target market/geography: ${targetMarket || "Global"}
Return JSON only with this shape:
{
 "overview": "short market overview",
 "competitors": [
  {"name":"company name","website":"official homepage URL if verified","description":"what the company actually offers","targetCustomers":"who it serves","geography":"markets served if verified","differentiation":"evidence-based positioning or 'Not established from sources'","evidence":"brief factual evidence summary"}
 ],
 "opportunities": ["practical differentiation hypotheses"],
 "caveats": ["data gaps and limitations"]
}
Rules:
- Return up to ${MAX_COMPETITORS} real, currently operating companies or products that directly or closely compete with this idea.
- Do not invent company names, domains, product features, market share, pricing, revenue, customers or geography.
- Prefer official company/product pages and reputable directories or publications. Use official websites as links only when verified.
- Include a mix of direct and adjacent competitors only when clearly labelled in description.
- If a fact cannot be verified, say "Not established from sources".
- Do not claim the list is exhaustive. Avoid unsupported rankings or recommendations.
- Keep source-backed facts distinct from your own strategic hypotheses.
`;
  let response;
  let liveSearchUsed = true;
  try {
    response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      },
    });
  } catch (error) {
    console.error("Industry competitor research provider error:", error);
    liveSearchUsed = false;
    response = await ai.models.generateContent({
      model: MODEL,
      contents: `${prompt}\nLive search is unavailable for this request. Return plausible candidate companies from general knowledge only. Set every fact that is uncertain to 'Unverified'; set website to null unless you are certain, and do not present any claim as researched or current.`,
      config: { temperature: 0.2 },
    }).catch((fallbackError) => {
      console.error("Industry competitor fallback error:", fallbackError);
      throw httpError("Industry suggestions could not be generated. Check the Gemini API key and quota, then try again.", 502);
    });
  }

  const parsed = extractJson(response.text);
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = [];
  const seen = new Set();
  for (const chunk of chunks) {
    const web = chunk.web;
    const url = normalizeUrl(web?.uri);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    sources.push({ title: String(web.title || new URL(url).hostname).slice(0, 180), url });
  }

  const competitors = (Array.isArray(parsed.competitors) ? parsed.competitors : [])
    .slice(0, MAX_COMPETITORS)
    .filter((item) => item && typeof item.name === "string" && item.name.trim())
    .map((item) => ({
      name: item.name.trim().slice(0, 140),
      website: liveSearchUsed ? normalizeUrl(item.website) : null,
      description: String(item.description || "Not established from sources").slice(0, 700),
      targetCustomers: String(item.targetCustomers || "Not established from sources").slice(0, 300),
      geography: String(item.geography || "Not established from sources").slice(0, 240),
      differentiation: String(item.differentiation || "Not established from sources").slice(0, 500),
      evidence: liveSearchUsed ? String(item.evidence || "See linked research sources").slice(0, 500) : "Unverified AI-generated candidate. Confirm this company and its offering independently.",
    }));

  return {
    overview: String(parsed.overview || "No market overview was returned.").slice(0, 1600),
    competitors,
    opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities.filter((x) => typeof x === "string").slice(0, 8).map((x) => x.slice(0, 500)) : [],
    caveats: Array.isArray(parsed.caveats) ? parsed.caveats.filter((x) => typeof x === "string").slice(0, 8).map((x) => x.slice(0, 500)) : [],
    sources,
    evidenceStatus: liveSearchUsed ? "Live search used; verify sources" : "Unverified AI-generated candidates; live search unavailable",
    model: MODEL,
    researchedAt: new Date().toISOString(),
    notice: liveSearchUsed
      ? "Research is a sourced starting point, not an exhaustive competitor census. Verify company details and market positioning before making business decisions."
      : "Google Search grounding was unavailable. These are unverified AI-generated candidates, not live research. No sources were checked; verify every company independently.",
  };
}
