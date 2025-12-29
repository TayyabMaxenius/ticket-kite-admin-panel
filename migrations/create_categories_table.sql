-- ============================================
-- CREATE CATEGORIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS categories (
  id smallserial PRIMARY KEY,
  term_id smallint UNIQUE,
  name text NOT NULL,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- CREATE INDEXES
-- ============================================

-- Index for term_id (for lookups)
CREATE INDEX IF NOT EXISTS idx_categories_term_id ON categories(term_id);

-- Index for name (for searching)
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Index for status (for filtering active/inactive)
CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);

-- ============================================
-- CREATE TRIGGER FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();

