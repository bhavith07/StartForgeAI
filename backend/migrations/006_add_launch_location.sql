ALTER TABLE public.startup_analyses
  ADD COLUMN IF NOT EXISTS launch_location TEXT NOT NULL DEFAULT '';

COMMENT ON COLUMN public.startup_analyses.launch_location IS
  'Founder-provided city or region used to contextualize directional startup launch cost estimates.';
