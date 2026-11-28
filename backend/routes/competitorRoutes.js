import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { geocodeLocation } from "../services/geocodingService.js";
import { searchOverpass } from "../services/overpassService.js";
import {
  createCompetitorSearch,
  getUserCompetitorSearches,
  getCompetitorSearchById,
  saveCompetitorInsights,
} from "../models/CompetitorSearch.js";
import { getAnalysisById } from "../models/StartupAnalysis.js";
import { generateCompetitorInsights } from "../services/competitorInsightService.js";
import { researchIndustryCompetitors } from "../services/industryCompetitorResearchService.js";
import { saveIndustryCompetitorResearch } from "../models/IndustryCompetitorResearch.js";

const router = express.Router();
const ALLOWED_RADII = [500, 1000, 2000, 3000, 5000, 10000];


router.post("/industry-search", authenticateToken, async (req, res) => {
  try {
    const idea = String(req.body?.idea || "").trim();
    const industry = String(req.body?.industry || "").trim();
    const targetMarket = String(req.body?.targetMarket || "Global").trim() || "Global";
    if (idea.length < 12 || idea.length > 1200) {
      return res.status(400).json({ success: false, message: "Describe your startup idea in 12–1,200 characters." });
    }
    if (industry.length < 2 || industry.length > 120) {
      return res.status(400).json({ success: false, message: "Enter an industry between 2 and 120 characters." });
    }
    if (targetMarket.length > 180) {
      return res.status(400).json({ success: false, message: "Target market must be 180 characters or fewer." });
    }
    const research = await researchIndustryCompetitors({ idea, industry, targetMarket });
    const saved = await saveIndustryCompetitorResearch({
      userId: Number(req.user.userId), idea, industry, targetMarket, research,
    });
    return res.status(200).json({ success: true, researchId: saved.id, research, createdAt: saved.created_at });
  } catch (error) {
    console.error("Industry competitor research error:", error);
    return res.status(error.status || 502).json({
      success: false,
      message: error.message || "Unable to research industry competitors right now.",
    });
  }
});

router.post("/search", authenticateToken, async (req, res) => {
  try {
    const {
      location,
      category,
      radiusMeters = 3000,
      analysisId = null,
    } = req.body || {};

    const cleanLocation = String(location || "").trim();
    const cleanCategory = String(category || "").trim();
    const radius = Number(radiusMeters);
    const userId = Number(req.user.userId);

    if (!cleanLocation || !cleanCategory) {
      return res.status(400).json({
        success: false,
        message: "Location and business category are required.",
      });
    }

    if (cleanLocation.length > 160 || cleanCategory.length > 80) {
      return res.status(400).json({
        success: false,
        message: "Location or business category is too long.",
      });
    }

    if (!ALLOWED_RADII.includes(radius)) {
      return res.status(400).json({
        success: false,
        message: "Choose a supported search radius.",
      });
    }

    let linkedAnalysis = null;
    if (analysisId !== null && analysisId !== "") {
      const parsedAnalysisId = Number(analysisId);
      if (!Number.isInteger(parsedAnalysisId) || parsedAnalysisId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid startup analysis ID.",
        });
      }

      linkedAnalysis = await getAnalysisById(parsedAnalysisId, userId);
      if (!linkedAnalysis) {
        return res.status(404).json({
          success: false,
          message: "The selected startup report was not found in your account.",
        });
      }
    }

    const point = await geocodeLocation(cleanLocation);
    const found = await searchOverpass({
      latitude: point.latitude,
      longitude: point.longitude,
      radiusMeters: radius,
      category: cleanCategory,
    });

    const saved = await createCompetitorSearch({
      userId,
      analysisId: linkedAnalysis?.id ?? null,
      locationName: point.displayName,
      latitude: point.latitude,
      longitude: point.longitude,
      radiusMeters: radius,
      category: cleanCategory,
      results: found.results,
      provider: "openstreetmap",
    });

    return res.status(200).json({
      success: true,
      searchId: saved.id,
      location: {
        name: point.displayName,
        latitude: point.latitude,
        longitude: point.longitude,
      },
      category: cleanCategory,
      radiusMeters: radius,
      ...found,
      note: "OpenStreetMap coverage varies by area. Results are mapped businesses, not a complete list of all competitors. Ratings and customer reviews are not provided in this phase.",
    });
  } catch (error) {
    console.error("Competitor search error:", error);
    return res.status(error.status || 502).json({
      success: false,
      message: error.message || "Unable to search for competitors right now.",
      ...(error.retryAfterSeconds ? { retryAfterSeconds: error.retryAfterSeconds } : {}),
    });
  }
});

router.get("/history", authenticateToken, async (req, res) => {
  try {
    const searches = await getUserCompetitorSearches(Number(req.user.userId));
    return res.json({ success: true, searches });
  } catch (error) {
    console.error("Competitor history error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load competitor search history.",
    });
  }
});

router.post("/:id/insights", authenticateToken, async (req, res) => {
  try {
    const searchId = Number(req.params.id);
    const userId = Number(req.user.userId);

    if (!Number.isInteger(searchId) || searchId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid competitor search ID.",
      });
    }

    const search = await getCompetitorSearchById(searchId, userId);
    if (!search) {
      return res.status(404).json({
        success: false,
        message: "Competitor search not found.",
      });
    }

    const regenerate = req.body?.regenerate === true;
    if (search.ai_insights && !regenerate) {
      return res.json({
        success: true,
        cached: true,
        searchId,
        insights: search.ai_insights,
        generatedAt: search.ai_insights_generated_at,
      });
    }

    let startupAnalysis = null;
    if (search.analysis_id) {
      startupAnalysis = await getAnalysisById(Number(search.analysis_id), userId);
      if (!startupAnalysis) {
        return res.status(409).json({
          success: false,
          message: "The startup report linked to this search is no longer available. Run a new search and select an available report.",
        });
      }
    }

    const insights = await generateCompetitorInsights({
      search,
      startupAnalysis,
    });

    const saved = await saveCompetitorInsights(searchId, userId, insights);
    if (!saved) {
      return res.status(404).json({
        success: false,
        message: "Competitor search could not be updated.",
      });
    }

    return res.json({
      success: true,
      cached: false,
      searchId,
      insights: saved.ai_insights,
      generatedAt: saved.ai_insights_generated_at,
    });
  } catch (error) {
    console.error("Competitor AI insights error:", error);
    return res.status(error.status || 502).json({
      success: false,
      message: error.message || "Unable to generate competitor insights right now.",
    });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid competitor search ID.",
      });
    }

    const search = await getCompetitorSearchById(id, Number(req.user.userId));
    if (!search) {
      return res.status(404).json({
        success: false,
        message: "Competitor search not found.",
      });
    }

    return res.json({ success: true, search });
  } catch (error) {
    console.error("Get competitor search error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load competitor search.",
    });
  }
});

export default router;
