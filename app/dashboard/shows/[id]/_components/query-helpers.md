# Query Helper Examples

## Get Show by product_slug

```typescript
// Fast query using indexed column
const getShowBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from("shows")
    .select("id, venue_id, status, product_slug, product_id, series_id, title, series_code, data")
    .eq("product_slug", slug)
    .single();
    
  if (error || !data) return null;
  
  // Return the data in your JSON format
  return {
    id: data.id,
    ...data.data, // All the show data from JSONB
  };
};

// Usage
const show = await getShowBySlug("sir-elton");
```

## Get All Shows (List View)

```typescript
const getAllShows = async () => {
  const { data, error } = await supabase
    .from("shows")
    .select("id, product_slug, title, data")
    .eq("status", "active")
    .order("created_at", { ascending: false });
    
  if (error) return [];
  
  // Transform to your list format
  return data.map(show => ({
    id: show.id,
    title: show.title || show.data?.title,
    product_slug: show.product_slug || show.data?.product_slug,
    // Extract other fields from data JSONB
    ...show.data,
  }));
};
```

