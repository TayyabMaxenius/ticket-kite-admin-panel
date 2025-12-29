-- ============================================
-- CREATE PRICE LEVELS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS price_levels (
  id smallserial PRIMARY KEY,
  price_level_id integer UNIQUE,
  name text NOT NULL,
  label text,
  description text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- CREATE INDEXES
-- ============================================

-- Index for price_level_id (for lookups)
CREATE INDEX IF NOT EXISTS idx_price_levels_price_level_id ON price_levels(price_level_id);

-- Index for name (for searching)
CREATE INDEX IF NOT EXISTS idx_price_levels_name ON price_levels(name);

-- Index for status (for filtering active/inactive)
CREATE INDEX IF NOT EXISTS idx_price_levels_status ON price_levels(status);

-- ============================================
-- CREATE TRIGGER FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_price_levels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_price_levels_updated_at
  BEFORE UPDATE ON price_levels
  FOR EACH ROW
  EXECUTE FUNCTION update_price_levels_updated_at();

