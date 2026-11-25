import { getDB } from "../config/db.js";

export async function createCompetitorSearch(search) {
  const db = getDB();
  const results = Array.isArray(search.results) ? search.results : [];

  const result = await db.query(
    `INSERT INTO competitor_searches
      (user_id, analysis_id, location_name, latitude, longitude,
       radius_meters, category, results, provider)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)
     RETURNING *`,
    [
      Number(search.userId),
      search.analysisId ? Number(search.analysisId) : null,
      search.locationName,
      Number(search.latitude),
      Number(search.longitude),
      Number(search.radiusMeters),
      search.category,
      JSON.stringify(results),
      search.provider || "openstreetmap",
    ]
  );

  return result.rows[0];
}

export async function getUserCompetitorSearches(userId) {
  const db = getDB();
  const result = await db.query(
    `SELECT
       id,
       analysis_id,
       location_name,
       latitude,
       longitude,
       radius_meters,
       category,
       jsonb_array_length(results) AS result_count,
       provider,
       searched_at,
       (ai_insights IS NOT NULL) AS has_ai_insights,
       ai_insights_generated_at
     FROM competitor_searches
     WHERE user_id = $1
     ORDER BY searched_at DESC
     LIMIT 50`,
    [Number(userId)]
  );

  return result.rows;
}

export async function getCompetitorSearchById(searchId, userId) {
  const db = getDB();
  const result = await db.query(
    `SELECT *
     FROM competitor_searches
     WHERE id = $1 AND user_id = $2
     LIMIT 1`,
    [Number(searchId), Number(userId)]
  );

  return result.rows[0] || null;
}

export async function saveCompetitorInsights(searchId, userId, insights) {
  if (!insights || typeof insights !== "object" || Array.isArray(insights)) {
    throw new Error("AI insights must be a valid JSON object.");
  }

  const db = getDB();
  const result = await db.query(
    `UPDATE competitor_searches
     SET ai_insights = $3::jsonb,
         ai_insights_generated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND user_id = $2
     RETURNING id, ai_insights, ai_insights_generated_at`,
    [Number(searchId), Number(userId), JSON.stringify(insights)]
  );

  return result.rows[0] || null;
}
