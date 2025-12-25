-- Create venues table from scratch
-- Run this FIRST before create_shows_table.sql
-- Run this in Supabase SQL Editor

-- ============================================
-- CREATE TABLE
-- ============================================

CREATE TABLE venues (
  id serial PRIMARY KEY,
  title text NOT NULL,
  subheading text,
  img_src text,
  description text,
  show_url text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- CREATE INDEXES
-- ============================================

-- Index for status (for filtering active/inactive)
CREATE INDEX idx_venues_status ON venues(status);

-- Index for title (for searching)
CREATE INDEX idx_venues_title ON venues(title);

-- Composite index for common queries
CREATE INDEX idx_venues_status_title ON venues(status, title) WHERE status = 'active';

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

