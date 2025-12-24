# Final Database Schema - Optimized for product_slug Filtering

## Recommended Schema (Hybrid Approach)

Since you only need to filter by `product_slug`, keep minimal columns for that + frequently accessed fields:

```sql
CREATE TABLE shows (
  id bigserial PRIMARY KEY,
  venue_id bigint REFERENCES venues(id),
  status text DEFAULT 'active',
  
  -- Keep frequently queried/accessed fields as columns
  product_slug text, -- PRIMARY FILTER - used for lookup
  product_id bigint, -- For external linking
  series_id text, -- For external linking
  title text, -- Frequently accessed
  series_code text, -- For URL routing/linking
  
  -- Everything else in JSONB
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for fast queries
CREATE INDEX idx_shows_product_slug ON shows(product_slug); -- PRIMARY INDEX for filtering
CREATE INDEX idx_shows_product_id ON shows(product_id);
CREATE INDEX idx_shows_status ON shows(status);
CREATE INDEX idx_shows_venue_id ON shows(venue_id);
CREATE INDEX idx_shows_data ON shows USING GIN(data); -- For JSONB queries
```

## Why This Approach?

✅ **Fast product_slug lookup**: Indexed column = instant query  
✅ **External linking**: product_id, series_id, series_code available for joins  
✅ **Frequently accessed**: title is accessed often, keep as column  
✅ **Flexible**: All other data in JSONB  
✅ **Minimal columns**: Only 5 data columns + id, venue_id, status  

## Query Examples

```sql
-- Get show by product_slug (FAST - indexed column)
SELECT id, venue_id, status, product_slug, product_id, series_id, title, series_code, data
FROM shows 
WHERE product_slug = 'sir-elton';

-- Get all shows
SELECT id, venue_id, status, product_slug, product_id, series_id, title, series_code, data
FROM shows 
WHERE status = 'active'
ORDER BY created_at DESC;

-- Get show by product_id (FAST - indexed column)
SELECT * FROM shows WHERE product_id = 23573;
```

## Save Structure

```javascript
{
  id: 23573,
  venue_id: 1833,
  status: 'active',
  product_slug: 'sir-elton', // Column for fast filtering
  product_id: 23573, // Column for linking
  series_id: '22793', // Column for linking
  title: 'Sir Elton - At the Piano: The Music of Elton John', // Column for quick access
  series_code: 'SirEltonAP', // Column for linking
  data: {
    // Everything stored here too (single source of truth)
    product_id: 23573,
    series_id: "22793",
    title: "Sir Elton - At the Piano: The Music of Elton John",
    product_slug: "sir-elton",
    // ... all other fields
  }
}
```

## Benefits

1. **Fast filtering**: `product_slug` is indexed column - instant lookup
2. **No duplication issues**: Store in both places - columns are just "cached" views
3. **Flexible**: Add new fields to JSONB without migrations
4. **Linkable**: product_id, series_id, series_code available for relationships
5. **Queryable**: Can query by product_slug, product_id, or series_code efficiently

## API/Route Example

```javascript
// Get show by product_slug
const { data, error } = await supabase
  .from("shows")
  .select("id, venue_id, status, product_slug, product_id, series_id, title, series_code, data")
  .eq("product_slug", "sir-elton")
  .single();

// Transform for API response (return just the data field)
return {
  id: data.id,
  ...data.data, // Spread all data
};
```

This gives you the best of both worlds: fast filtering on product_slug + flexibility of JSONB!

