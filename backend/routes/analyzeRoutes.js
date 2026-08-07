import express from "express";
import { analyzeStartup } from "../services/geminiService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    console.log(req.body); // Add this

    const analysis = await analyzeStartup(req.body);

    res.json({
      success: true,
      analysis,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;