import { getDB } from "../config/db.js";

// ==========================================
// CREATE STARTUP ANALYSIS
// ==========================================

export async function createAnalysis(analysis) {
  const db = getDB();

  const result = await db.query(
    `
    INSERT INTO startup_analyses (
      user_id,
      startup_name,
      idea,
      industry,
      audience,
      business_model,
      startup_score,
      market_potential,
      competition,
      estimated_cost,
      strengths,
      weaknesses,
      suggestions,
      created_at
    )
    VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9, $10,
      $11, $12, $13, $14
    )
    RETURNING *
    `,
    [
      analysis.userId,
      analysis.startupName,
      analysis.idea,
      analysis.industry,
      analysis.audience,
      analysis.model,
      analysis.startupScore,
      analysis.marketPotential,
      analysis.competition,
      analysis.estimatedCost,
      JSON.stringify(analysis.strengths || []),
      JSON.stringify(analysis.weaknesses || []),
      JSON.stringify(analysis.suggestions || []),
      analysis.createdAt || new Date(),
    ]
  );

  return result.rows[0];
}

// ==========================================
// GET USER ANALYSIS HISTORY
// ==========================================

export async function getUserAnalyses(userId) {
  const db = getDB();

  const result = await db.query(
    `
    SELECT *
    FROM startup_analyses
    WHERE user_id = $1
    ORDER BY created_at DESC
    `,
    [userId]
  );

  return result.rows;
}

// ==========================================
// GET SINGLE ANALYSIS
// ==========================================

export async function getAnalysisById(analysisId, userId) {
  const db = getDB();

  const result = await db.query(
    `
    SELECT *
    FROM startup_analyses
    WHERE id = $1
      AND user_id = $2
    LIMIT 1
    `,
    [analysisId, userId]
  );

  return result.rows[0] || null;
}