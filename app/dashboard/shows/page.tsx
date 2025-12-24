"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase/client";

interface Show {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  discounted_price: number | null;
  duration_minutes: string | null;
  category: string | null;
  status: string | null;
  image_url: string | null;
}

export default function ShowsPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadShows();
  }, []);

  const loadShows = async () => {
    try {
      setLoading(true);
      // Fetch minimal columns (for filtering) + data JSONB
      const { data, error } = await supabase
        .from("shows")
        .select("id, venue_id, status, product_slug, product_id, series_id, title, series_code, data")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading shows:", error);
        alert("Failed to load shows: " + error.message);
        return;
      }

      // Transform data from JSONB to display format
      const transformedShows = (data || []).map((show: {
        id: number;
        venue_id: number | null; // integer type
        status: string | null;
        product_slug?: string | null;
        product_id?: number | null;
        series_id?: string | null;
        title?: string | null;
        series_code?: string | null;
        data: Record<string, unknown> | null;
      }) => {
        const showData = show.data || {};
        const categories = Array.isArray(showData.categories) ? showData.categories : [];
        // Use column values if available, otherwise fallback to JSONB data
        return {
          id: show.id,
          name: (show.title as string) || (showData.title as string) || (showData.name as string) || "",
          description: (showData.description as string) || null,
          price: showData.regular_price
            ? parseFloat(String(showData.regular_price))
            : (showData.price ? parseFloat(String(showData.price)) : null),
          discounted_price: showData.sale_price
            ? parseFloat(String(showData.sale_price))
            : (showData.discounted_price ? parseFloat(String(showData.discounted_price)) : null),
          duration_minutes: (showData.duration_minutes as string) || null,
          category: (showData.category as string) ||
            (categories.length > 0 && (categories[0] as { name?: string })?.name) ||
            null,
          status: show.status || "active",
          image_url: (showData.img_src as string) || (showData.image_url as string) || null,
        };
      });

      setShows(transformedShows);
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("Failed to load shows");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (showId: number, showName: string) => {
    if (!confirm(`Are you sure you want to delete "${showName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase.from("shows").delete().eq("id", showId);

      if (error) {
        console.error("Error deleting show:", error);
        alert("Failed to delete show: " + error.message);
        return;
      }

      // Reload shows after deletion
      await loadShows();
      alert("Show deleted successfully!");
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("Failed to delete show");
    }
  };

  const filteredShows = shows.filter((show) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      show.name?.toLowerCase().includes(query) ||
      show.category?.toLowerCase().includes(query) ||
      show.description?.toLowerCase().includes(query)
    );
  });

  const formatPrice = (
    price: number | null,
    discountedPrice: number | null
  ) => {
    if (discountedPrice && price) {
      return `$${discountedPrice.toFixed(2)} - $${price.toFixed(2)}`;
    } else if (price) {
      return `$${price.toFixed(2)}`;
    } else if (discountedPrice) {
      return `$${discountedPrice.toFixed(2)}`;
    }
    return "N/A";
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500";
      case "inactive":
        return "bg-gray-500/10 text-gray-500";
      case "draft":
        return "bg-yellow-500/10 text-yellow-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shows</h1>
          <p className="text-muted-foreground">
            Manage all your shows, performances, and events
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/shows/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Show
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter shows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search shows by name, category, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredShows.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "No shows found matching your search."
                : "No shows found. Create your first show to get started."}
            </p>
            {!searchQuery && (
              <Button asChild>
                <Link href="/dashboard/shows/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Show
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Shows Grid */}
      {!loading && filteredShows.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredShows.map((show) => (
            <Card key={show.id} className="overflow-hidden group">
              <div className="aspect-video w-full bg-muted relative overflow-hidden">
                {show.image_url ? (
                  <Image
                    src={show.image_url}
                    alt={show.name || "Show image"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
                    <span className="text-muted-foreground text-sm">
                      No Image
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-primary/5" />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">
                      {show.name || "Untitled Show"}
                    </CardTitle>
                    {show.category && (
                      <CardDescription className="truncate">
                        {show.category}
                      </CardDescription>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        id={`show-menu-${show.id}`}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/dashboard/shows/${show.id}`}
                          className="flex items-center"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() =>
                          handleDelete(show.id, show.name || "this show")
                        }
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium">
                      {formatPrice(show.price, show.discounted_price)}
                    </span>
                  </div>
                  {show.duration_minutes && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">
                        {show.duration_minutes} min
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs capitalize ${getStatusColor(
                        show.status
                      )}`}
                    >
                      {show.status || "active"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
