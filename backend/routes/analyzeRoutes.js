import express from "express";

import { analyzeStartup } from "../services/geminiService.js";

import {
  createAnalysis,
  getUserAnalyses,
  getAnalysisById,
} from "../models/StartupAnalysis.js";

import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      startupName,
      idea,
      industry,
      audience,
      model,
    } = req.body;

    if (!startupName || !idea) {
      return res.status(400).json({
        success: false,
        message: "Startup name and idea are required.",
      });
    }

    console.log("Analyzing startup:", startupName);
    console.log("Authenticated user:", req.user.userId);

    const aiResponse = await analyzeStartup({
      startupName,
      idea,
      industry,
      audience,
      model,
    });

    let parsedAnalysis;

    try {
      parsedAnalysis =
        typeof aiResponse === "string"
          ? JSON.parse(aiResponse)
          : aiResponse;
    } catch (error) {
      console.error("Invalid AI JSON response:", error.message);

      return res.status(502).json({
        success: false,
        message: "AI returned an invalid analysis. Please try again.",
      });
    }

    const score = parsedAnalysis.startupScore;

    if (
      !Number.isInteger(score) ||
      score < 0 ||
      score > 100
    ) {
      return res.status(502).json({
        success: false,
        message: "AI returned an invalid startup score.",
      });
    }

    const savedAnalysis = await createAnalysis({
      userId: Number(req.user.userId),

      startupName,
      idea,
      industry,
      audience,
      model,

      startupScore: score,
      marketPotential: parsedAnalysis.marketPotential,
      competition: parsedAnalysis.competition,
      estimatedCost: parsedAnalysis.estimatedCost,

      targetMarket: parsedAnalysis.targetMarket,
      growthPotential: parsedAnalysis.growthPotential,

      marketChallenges: parsedAnalysis.marketChallenges,
      competitors: parsedAnalysis.competitors,
      competitorStrengths: parsedAnalysis.competitorStrengths,
      competitorWeaknesses: parsedAnalysis.competitorWeaknesses,
      differentiationOpportunities:
        parsedAnalysis.differentiationOpportunities,

      strengths: parsedAnalysis.strengths,
      weaknesses: parsedAnalysis.weaknesses,
      suggestions: parsedAnalysis.suggestions,

      createdAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Startup analyzed and saved successfully.",
      analysis: JSON.stringify(parsedAnalysis),
      analysisId: savedAnalysis.id,
    });
  } catch (error) {
    console.error("Analysis error:", error.message);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to analyze startup. Please try again.",
    });
  }
});

router.get("/history", authenticateToken, async (req, res) => {
  try {
    const analyses = await getUserAnalyses(
      Number(req.user.userId)
    );

    return res.json({
      success: true,
      analyses,
    });
  } catch (error) {
    console.error("History error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to load analysis history.",
    });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const analysisId = Number(req.params.id);

    if (!Number.isInteger(analysisId) || analysisId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid analysis ID.",
      });
    }

    const analysis = await getAnalysisById(
      analysisId,
      Number(req.user.userId)
    );

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found.",
      });
    }

    return res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Get analysis error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to load analysis.",
    });
  }
});

export default router;