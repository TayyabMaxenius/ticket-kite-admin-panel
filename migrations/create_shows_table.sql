-- Create shows table from scratch
-- Run this in Supabase SQL Editor after manually deleting the old shows table

-- ============================================
-- CREATE TABLE
-- ============================================

CREATE TABLE shows (
  id serial PRIMARY KEY,
  venue_id integer REFERENCES venues(id) ON DELETE SET NULL,
  status text DEFAULT 'active',
  
  -- Columns for filtering and fast queries
  product_slug text,
  product_id bigint,
  series_id text,
  title text,
  series_code text,
  
  -- All show data stored here (JSONB)
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- CREATE INDEXES
-- ============================================

-- Index for product_slug (PRIMARY FILTER - most important)
CREATE INDEX idx_shows_product_slug ON shows(product_slug) WHERE product_slug IS NOT NULL;

-- Index for product_id (for external linking)
CREATE INDEX idx_shows_product_id ON shows(product_id) WHERE product_id IS NOT NULL;

-- Index for status (for filtering active/inactive)
CREATE INDEX idx_shows_status ON shows(status);

-- Index for venue_id (for venue-based queries)
CREATE INDEX idx_shows_venue_id ON shows(venue_id) WHERE venue_id IS NOT NULL;

-- GIN index for JSONB data (enables fast JSONB queries)
CREATE INDEX idx_shows_data ON shows USING GIN(data);

-- Index for series_code (for series-based queries)
CREATE INDEX idx_shows_series_code ON shows(series_code) WHERE series_code IS NOT NULL;

-- Composite index for common query patterns
CREATE INDEX idx_shows_status_product_slug ON shows(status, product_slug) WHERE status = 'active' AND product_slug IS NOT NULL;

-- ============================================
-- CREATE TRIGGER FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_shows_updated_at
    BEFORE UPDATE ON shows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONE! Your table is ready to use.
-- ============================================

