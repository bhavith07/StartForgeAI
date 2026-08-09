import { getDB } from "../config/db.js";

export async function createAnalysis(analysis) {
  const db = getDB();

  const result = await db
    .collection("startupAnalyses")
    .insertOne(analysis);

  return {
    _id: result.insertedId,
    ...analysis,
  };
}

export async function getUserAnalyses(userId) {
  const db = getDB();

  return await db
    .collection("startupAnalyses")
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getAnalysisById(
  analysisId,
  userId
) {
  const db = getDB();

  return await db.collection("startupAnalyses").findOne({
    _id: analysisId,
    userId,
  });
}