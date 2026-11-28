import { getDB } from "../config/db.js";

export async function saveIndustryCompetitorResearch({ userId, idea, industry, targetMarket, research }) {
  const db = getDB();
  const result = await db.query(
    `INSERT INTO industry_competitor_researches
      (user_id, startup_idea, industry, target_market, research)
     VALUES ($1, $2, $3, $4, $5::jsonb)
     RETURNING id, startup_idea, industry, target_market, research, created_at`,
    [Number(userId), idea, industry, targetMarket, JSON.stringify(research)]
  );
  return result.rows[0];
}

export async function getIndustryCompetitorResearches(userId) {
  const db = getDB();
  const result = await db.query(
    `SELECT id, startup_idea, industry, target_market, created_at,
            jsonb_array_length(research->'competitors') AS competitor_count
     FROM industry_competitor_researches
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 20`,
    [Number(userId)]
  );
  return result.rows;
}
