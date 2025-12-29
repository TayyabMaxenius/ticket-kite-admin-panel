-- Create live_shows table
-- Run this in Supabase SQL Editor

-- ============================================
-- CREATE TABLE
-- ============================================

CREATE TABLE live_shows (
  id serial PRIMARY KEY,
  name text NOT NULL,
  img_src text,
  show_url text,
  redirect_url text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- CREATE INDEXES
-- ============================================

CREATE INDEX idx_live_shows_status ON live_shows(status);
CREATE INDEX idx_live_shows_name ON live_shows(name);
CREATE INDEX idx_live_shows_show_url ON live_shows(show_url);

-- ============================================
-- CREATE TRIGGER FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_live_shows_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_live_shows_updated_at
    BEFORE UPDATE ON live_shows
    FOR EACH ROW
    EXECUTE FUNCTION update_live_shows_updated_at();

-- ============================================
-- DONE! Your live_shows table has been created.
-- ============================================

