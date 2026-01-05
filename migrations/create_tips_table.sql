-- ============================================
-- CREATE TIPS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS tips (
  id serial PRIMARY KEY,
  post_id text,
  title text NOT NULL,
  img_src text,
  post_slug text,
  excerpt text,
  content text,
  categories jsonb DEFAULT '[]'::jsonb,
  tags jsonb DEFAULT '[]'::jsonb,
  yoast jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- CREATE INDEXES
-- ============================================

-- Index for title (for searching)
CREATE INDEX IF NOT EXISTS idx_tips_title ON tips(title);

-- Index for post_slug (for URL lookups)
CREATE INDEX IF NOT EXISTS idx_tips_post_slug ON tips(post_slug) WHERE post_slug IS NOT NULL;

-- Index for post_id (for external linking)
CREATE INDEX IF NOT EXISTS idx_tips_post_id ON tips(post_id) WHERE post_id IS NOT NULL;

-- GIN index for categories (enables fast JSONB queries)
CREATE INDEX IF NOT EXISTS idx_tips_categories ON tips USING GIN(categories);

-- GIN index for tags (enables fast JSONB queries)
CREATE INDEX IF NOT EXISTS idx_tips_tags ON tips USING GIN(tags);

-- GIN index for yoast (enables fast JSONB queries)
CREATE INDEX IF NOT EXISTS idx_tips_yoast ON tips USING GIN(yoast);

-- ============================================
-- CREATE TRIGGER FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_tips_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tips_updated_at
  BEFORE UPDATE ON tips
  FOR EACH ROW
  EXECUTE FUNCTION update_tips_updated_at();

-- ============================================
-- DONE! Your tips table has been created.
-- ============================================

