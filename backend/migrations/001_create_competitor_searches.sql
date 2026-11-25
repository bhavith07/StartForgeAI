-- StartForge AI: competitor discovery persistence
-- Run this once against the existing startforge_ai PostgreSQL database.
-- Deliberately keeps user_id/analysis_id as integer columns without guessing
-- the existing PK/FK definitions. Add foreign keys after confirming your schema.

CREATE TABLE IF NOT EXISTS competitor_searches (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    analysis_id INTEGER NULL,
    location_name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    radius_meters INTEGER NOT NULL CHECK (radius_meters IN (500, 1000, 2000, 3000, 5000, 10000)),
    category TEXT NOT NULL,
    results JSONB NOT NULL DEFAULT '[]'::jsonb,
    provider TEXT NOT NULL DEFAULT 'openstreetmap',
    searched_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_competitor_searches_user_date
    ON competitor_searches (user_id, searched_at DESC);

CREATE INDEX IF NOT EXISTS idx_competitor_searches_analysis
    ON competitor_searches (analysis_id)
    WHERE analysis_id IS NOT NULL;
