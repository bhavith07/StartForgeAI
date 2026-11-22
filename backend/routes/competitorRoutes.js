import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { searchOpenStreetMapCompetitors } from "../services/osmCompetitorService.js";

const router = express.Router();

router.get("/search", authenticateToken, async (req, res) => {
  try {
    const industry = String(req.query.industry || "").trim();
    const location = String(req.query.location || "").trim();
    const requestedRadius = Number(req.query.radius || 5000);

    if (!industry || !location) {
      return res.status(400).json({
        success: false,
        message: "Industry and location are required.",
      });
    }

    if (industry.length > 100 || location.length > 160) {
      return res.status(400).json({
        success: false,
        message: "Industry or location is too long.",
      });
    }

    if (!Number.isInteger(requestedRadius) || requestedRadius < 1000 || requestedRadius > 20000) {
      return res.status(400).json({
        success: false,
        message: "Radius must be between 1,000 and 20,000 metres.",
      });
    }

    const result = await searchOpenStreetMapCompetitors({
      industry,
      location,
      radius: requestedRadius,
    });

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Competitor search error:", error.message);
    return res.status(error.status || 502).json({
      success: false,
      message: error.message || "Unable to search competitors right now.",
    });
  }
});

export default router;
