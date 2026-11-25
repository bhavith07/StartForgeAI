-- StartForge AI: persist Gemini-generated competitor insights.
-- Run once against the existing startforge_ai PostgreSQL database.
-- This migration only adds nullable columns; it does not modify existing records.

ALTER TABLE public.competitor_searches
  ADD COLUMN IF NOT EXISTS ai_insights JSONB;

ALTER TABLE public.competitor_searches
  ADD COLUMN IF NOT EXISTS ai_insights_generated_at TIMESTAMPTZ;

COMMENT ON COLUMN public.competitor_searches.ai_insights IS
  'Gemini-generated interpretation of the saved OpenStreetMap competitor search; not verified business facts.';
