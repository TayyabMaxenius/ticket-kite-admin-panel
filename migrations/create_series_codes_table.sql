-- ============================================
-- CREATE SERIES CODES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS series_codes (
  id smallserial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- CREATE INDEXES
-- ============================================

-- Index for name (for searching)
CREATE INDEX IF NOT EXISTS idx_series_codes_name ON series_codes(name);

-- Index for status (for filtering active/inactive)
CREATE INDEX IF NOT EXISTS idx_series_codes_status ON series_codes(status);

-- ============================================
-- CREATE TRIGGER FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_series_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_series_codes_updated_at
  BEFORE UPDATE ON series_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_series_codes_updated_at();

