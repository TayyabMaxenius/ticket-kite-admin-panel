-- Create hotels table
-- Run this in Supabase SQL Editor

-- ============================================
-- CREATE TABLE
-- ============================================

CREATE TABLE hotels (
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

CREATE INDEX idx_hotels_status ON hotels(status);
CREATE INDEX idx_hotels_name ON hotels(name);
CREATE INDEX idx_hotels_show_url ON hotels(show_url);

-- ============================================
-- CREATE TRIGGER FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_hotels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_hotels_updated_at
    BEFORE UPDATE ON hotels
    FOR EACH ROW
    EXECUTE FUNCTION update_hotels_updated_at();

-- ============================================
-- DONE! Your hotels table has been created.
-- ============================================

