-- ============================================
-- CREATE PROMOTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS promotions (
  id serial PRIMARY KEY,
  promotion_id integer UNIQUE,
  name text NOT NULL,
  code text NOT NULL,
  require_even_number_of_tickets boolean DEFAULT false,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- CREATE INDEXES
-- ============================================

-- Index for promotion_id (for lookups)
CREATE INDEX IF NOT EXISTS idx_promotions_promotion_id ON promotions(promotion_id);

-- Index for code (for searching/lookups)
CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code);

-- Index for name (for searching)
CREATE INDEX IF NOT EXISTS idx_promotions_name ON promotions(name);

-- Index for status (for filtering active/inactive)
CREATE INDEX IF NOT EXISTS idx_promotions_status ON promotions(status);

-- ============================================
-- CREATE TRIGGER FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_promotions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_promotions_updated_at
  BEFORE UPDATE ON promotions
  FOR EACH ROW
  EXECUTE FUNCTION update_promotions_updated_at();

