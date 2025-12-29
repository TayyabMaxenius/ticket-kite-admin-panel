-- Create tours table
-- Run this in Supabase SQL Editor

-- ============================================
-- CREATE TABLE
-- ============================================

CREATE TABLE tours (
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

CREATE INDEX idx_tours_status ON tours(status);
CREATE INDEX idx_tours_name ON tours(name);
CREATE INDEX idx_tours_show_url ON tours(show_url);

-- ============================================
-- CREATE TRIGGER FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_tours_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_tours_updated_at
    BEFORE UPDATE ON tours
    FOR EACH ROW
    EXECUTE FUNCTION update_tours_updated_at();

-- ============================================
-- DONE! Your tours table has been created.
-- ============================================

