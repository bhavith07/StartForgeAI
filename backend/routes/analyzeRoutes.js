import express from "express";

import { analyzeStartup } from "../services/geminiService.js";

import {
  createAnalysis,
  getUserAnalyses,
  getAnalysisById,
} from "../models/StartupAnalysis.js";

import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================================================
// ANALYZE STARTUP
// ======================================================

router.post("/", authenticateToken, async (req, res) => {
  try {
    console.log("Startup request:", req.body);
    console.log("User:", req.user);

    // Analyze using Gemini
    const analysis = await analyzeStartup(req.body);

    // Convert Gemini response to JSON
    let parsedAnalysis;

    try {
      parsedAnalysis =
        typeof analysis === "string"
          ? JSON.parse(analysis)
          : analysis;
    } catch (error) {
      console.error(
        "Failed to parse Gemini response:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "AI returned an invalid analysis.",
      });
    }

    // Save analysis to PostgreSQL
    const savedAnalysis = await createAnalysis({
      userId: Number(req.user.userId),
      startupName: req.body.startupName,
      idea: req.body.idea,
      industry: req.body.industry,
      audience: req.body.audience,
      model: req.body.model,
      startupScore: parsedAnalysis.startupScore,
      marketPotential: parsedAnalysis.marketPotential,
      competition: parsedAnalysis.competition,
      estimatedCost: parsedAnalysis.estimatedCost,
      strengths: parsedAnalysis.strengths || [],
      weaknesses: parsedAnalysis.weaknesses || [],
      suggestions: parsedAnalysis.suggestions || [],
      createdAt: new Date(),
    });

    return res.json({
      success: true,
      message: "Startup analyzed and saved successfully.",
      analysis: JSON.stringify(parsedAnalysis),
      analysisId: savedAnalysis.id,
    });
  } catch (error) {
    console.error("Analysis error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ======================================================
// GET USER ANALYSIS HISTORY
// ======================================================

router.get(
  "/history",
  authenticateToken,
  async (req, res) => {
    try {
      const analyses = await getUserAnalyses(
        Number(req.user.userId)
      );

      return res.json({
        success: true,
        analyses,
      });
    } catch (error) {
      console.error("History error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load analysis history.",
      });
    }
  }
);

// ======================================================
// GET SINGLE ANALYSIS
// ======================================================

router.get(
  "/:id",
  authenticateToken,
  async (req, res) => {
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
      console.error("Get analysis error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load analysis.",
      });
    }
  }
);

export default router;