-- ============================================
-- CREATE EVENTS TABLE
-- ============================================
-- Events are linked to shows and represent specific date/time instances
-- Each event inherits price levels and promotions from its parent show
-- Each promotion includes priceBlocks for all price levels with pricing

CREATE TABLE IF NOT EXISTS events (
  id serial PRIMARY KEY,
  show_id integer NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  event_date timestamptz NOT NULL,
  event_end_date timestamptz, -- Optional end date/time
  status text DEFAULT 'active', -- active, cancelled, sold_out, etc.
  promotions jsonb DEFAULT '[]'::jsonb, -- Array of promotion objects with priceBlocks
  price_levels jsonb DEFAULT '[]'::jsonb, -- Array of price level objects with availability
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- CREATE INDEXES
-- ============================================

-- Index for show_id (for finding all events for a show)
CREATE INDEX IF NOT EXISTS idx_events_show_id ON events(show_id);

-- Index for event_date (for date-based queries)
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);

-- Index for status (for filtering by status)
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- Composite index for show_id and event_date (common query pattern)
CREATE INDEX IF NOT EXISTS idx_events_show_date ON events(show_id, event_date);

-- ============================================
-- CREATE TRIGGER FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_events_updated_at();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE events IS 'Events linked to shows, each event represents a specific date/time instance';
COMMENT ON COLUMN events.show_id IS 'Reference to the parent show (required)';
COMMENT ON COLUMN events.promotions IS 'JSONB array of promotion objects, each containing priceBlocks with pricing (fullRetailPrice, fullPurchasePrice) for all price levels';
COMMENT ON COLUMN events.price_levels IS 'JSONB array of price level objects, each with its own ticket availability (number of seats)';

