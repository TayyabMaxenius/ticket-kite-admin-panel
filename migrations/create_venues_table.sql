-- Create venues table from scratch
-- Run this FIRST before create_shows_table.sql
-- Run this in Supabase SQL Editor

-- ============================================
-- CREATE TABLE
-- ============================================

CREATE TABLE venues (
  id serial PRIMARY KEY,
  name text NOT NULL,
  parent_venue text,
  address text,
  city text,
  state text,
  zip_code text,
  capacity integer,
  phone text,
  email text,
  website text,
  status text DEFAULT 'active',
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- CREATE INDEXES
-- ============================================

-- Index for status (for filtering active/inactive)
CREATE INDEX idx_venues_status ON venues(status);

-- Index for name (for searching)
CREATE INDEX idx_venues_name ON venues(name);

-- Index for parent_venue (for filtering by parent)
CREATE INDEX idx_venues_parent_venue ON venues(parent_venue) WHERE parent_venue IS NOT NULL;

-- Composite index for common queries
CREATE INDEX idx_venues_status_name ON venues(status, name) WHERE status = 'active';

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
CREATE TRIGGER update_venues_updated_at
    BEFORE UPDATE ON venues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONE! Your venues table is ready to use.
-- Next: Run create_shows_table.sql
-- ============================================

