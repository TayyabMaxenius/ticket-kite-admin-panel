-- ============================================
-- CREATE TAGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS tags (
  id serial PRIMARY KEY,
  term_id integer UNIQUE,
  name text NOT NULL,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- CREATE INDEXES
-- ============================================

-- Index for term_id (for lookups)
CREATE INDEX IF NOT EXISTS idx_tags_term_id ON tags(term_id);

-- Index for name (for searching)
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- Index for status (for filtering active/inactive)
CREATE INDEX IF NOT EXISTS idx_tags_status ON tags(status);

-- ============================================
-- CREATE TRIGGER FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_tags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tags_updated_at
  BEFORE UPDATE ON tags
  FOR EACH ROW
  EXECUTE FUNCTION update_tags_updated_at();

