-- Create attractions table
-- Run this in Supabase SQL Editor

-- ============================================
-- CREATE TABLE
-- ============================================

CREATE TABLE attractions (
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

CREATE INDEX idx_attractions_status ON attractions(status);
CREATE INDEX idx_attractions_name ON attractions(name);
CREATE INDEX idx_attractions_show_url ON attractions(show_url);

-- ============================================
-- CREATE TRIGGER FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_attractions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_attractions_updated_at
    BEFORE UPDATE ON attractions
    FOR EACH ROW
    EXECUTE FUNCTION update_attractions_updated_at();

-- ============================================
-- DONE! Your attractions table has been created.
-- ============================================

