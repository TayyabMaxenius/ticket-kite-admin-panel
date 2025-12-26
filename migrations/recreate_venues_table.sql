-- Recreate venues table with new structure
-- This will DELETE all existing data and recreate the table
-- Run this in Supabase SQL Editor

-- ============================================
-- DROP EXISTING TABLE (This will delete all data!)
-- ============================================

DROP TABLE IF EXISTS venues CASCADE;

-- ============================================
-- CREATE NEW TABLE
-- ============================================

CREATE TABLE venues (
  id serial PRIMARY KEY,
  name text NOT NULL,
  external_venue_id text,
  address1 text,
  address2 text,
  city text,
  state text,
  postal_code text,
  country text,
  currency_symbol text,
  currency_locale text,
  timezone text,
  timezone_info jsonb,
  img_src text,
  description text,
  venue_url text,
  status text DEFAULT 'active',
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

-- Index for external_venue_id (for lookups)
CREATE INDEX idx_venues_external_venue_id ON venues(external_venue_id);

-- Index for venue_url (for lookups)
CREATE INDEX idx_venues_venue_url ON venues(venue_url);

-- Index for city and state (for location-based queries)
CREATE INDEX idx_venues_city_state ON venues(city, state);

-- Composite index for common queries
CREATE INDEX idx_venues_status_name ON venues(status, name) WHERE status = 'active';

-- ============================================
-- FUNCTION TO GENERATE VENUE_URL FROM NAME
-- ============================================

-- Function to generate venue_url from name (lowercase, spaces to hyphens)
CREATE OR REPLACE FUNCTION generate_venue_url(venue_name text)
RETURNS text AS $$
BEGIN
  -- Convert to lowercase
  -- Replace spaces with hyphens
  -- Remove special characters except hyphens and alphanumeric
  -- Remove multiple consecutive hyphens
  -- Trim hyphens from start and end
  RETURN lower(
    trim(
      regexp_replace(
        regexp_replace(
          regexp_replace(venue_name, '[^a-zA-Z0-9\s-]', '', 'g'),
          '\s+', '-', 'g'
        ),
        '-+', '-', 'g'
      ),
      '-'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- TRIGGER TO AUTO-GENERATE VENUE_URL
-- ============================================

-- Function to auto-generate venue_url before insert or update
CREATE OR REPLACE FUNCTION auto_generate_venue_url()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate venue_url from name if it's not already set or name changed
  IF NEW.venue_url IS NULL OR NEW.venue_url = '' OR (OLD IS NULL OR NEW.name != OLD.name) THEN
    NEW.venue_url := generate_venue_url(NEW.name);
  END IF;
  
  -- Update updated_at timestamp
  NEW.updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate venue_url (fires on INSERT or UPDATE)
CREATE TRIGGER trigger_auto_generate_venue_url
  BEFORE INSERT OR UPDATE ON venues
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_venue_url();

-- ============================================
-- CREATE TRIGGER FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp (if not already exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at (backup, but auto_generate_venue_url already handles this)
CREATE TRIGGER update_venues_updated_at
    BEFORE UPDATE ON venues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONE! Your venues table has been recreated.
-- ============================================
