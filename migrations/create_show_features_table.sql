-- ============================================
-- CREATE SHOW FEATURES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS show_features (
  id smallserial PRIMARY KEY,
  title text NOT NULL,
  description text,
  img_url text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- CREATE INDEXES
-- ============================================

-- Index for title (for searching)
CREATE INDEX IF NOT EXISTS idx_show_features_title ON show_features(title);

-- Index for status (for filtering active/inactive)
CREATE INDEX IF NOT EXISTS idx_show_features_status ON show_features(status);

-- ============================================
-- CREATE TRIGGER FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_show_features_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_show_features_updated_at
  BEFORE UPDATE ON show_features
  FOR EACH ROW
  EXECUTE FUNCTION update_show_features_updated_at();

