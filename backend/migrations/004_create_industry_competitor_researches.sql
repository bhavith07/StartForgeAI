CREATE TABLE IF NOT EXISTS industry_competitor_researches (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  startup_idea TEXT NOT NULL,
  industry VARCHAR(120) NOT NULL,
  target_market VARCHAR(180) NOT NULL DEFAULT 'Global',
  research JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_industry_competitor_researches_user_created
  ON industry_competitor_researches (user_id, created_at DESC);
