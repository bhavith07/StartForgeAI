-- Keep the expanded technology startup assessment alongside legacy columns.
-- The JSONB payload is returned with the existing authenticated report record.
ALTER TABLE public.startup_analyses
  ADD COLUMN IF NOT EXISTS founder_guide JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.startup_analyses.founder_guide IS
  'Technology startup guidance: architecture, MVP, stack, roadmap, estimates, risks, assumptions and candidate competitor research.';
