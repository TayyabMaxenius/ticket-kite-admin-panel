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

// Categories we treat as "other shows" (tours, attractions, hotels, etc.)
const OTHER_SHOW_CATEGORIES = [
  "Tour",
  "Attraction",
  "Hotel Package",
  "Hotel",
  "Excursion",
] as const;

type OtherCategoryFilter = "" | (typeof OTHER_SHOW_CATEGORIES)[number];

export default function OtherShowsPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState<OtherCategoryFilter>("");

  useEffect(() => {
    void loadShows();
  }, []);

  const loadShows = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("shows")
        .select(
          "id, name, description, price, discounted_price, duration_minutes, category, status, image_url",
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading other shows:", error);
        alert("Failed to load other shows: " + (error.message || ""));
        return;
      }

      // Only keep shows whose category is one of our "other" types
      const filtered =
        data?.filter((show) =>
          show.category
            ? OTHER_SHOW_CATEGORIES.some(
                (c) => c.toLowerCase() === show.category.toLowerCase(),
              )
            : false,
        ) ?? [];

      setShows(filtered);
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("Failed to load other shows");
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

      await loadShows();
      alert("Show deleted successfully!");
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("Failed to delete show");
    }
  };

  const filteredShows = shows.filter((show) => {
    if (categoryFilter) {
      if (!show.category) return false;
      if (show.category.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }
    }

    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      show.name?.toLowerCase().includes(query) ||
      show.description?.toLowerCase().includes(query) ||
      show.category?.toLowerCase().includes(query)
    );
  });

  const formatPrice = (
    price: number | null,
    discountedPrice: number | null,
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
          <h1 className="text-3xl font-bold tracking-tight">Other Shows</h1>
          <p className="text-muted-foreground">
            Manage tours, attractions, hotel packages, and other non-venue
            shows.
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
          <CardDescription>
            Search and filter tours, attractions, and hotel shows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search other shows by name, category, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Show type:
              </span>
              <select
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(e.target.value as OtherCategoryFilter)
                }
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All</option>
                {OTHER_SHOW_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
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
            <p className="mb-4 text-muted-foreground">
              {searchQuery || categoryFilter
                ? "No other shows found matching your filters."
                : "No other shows found. Tag some shows as Tour, Attraction, or Hotel Package in the category field."}
            </p>
            <Button asChild>
              <Link href="/dashboard/shows/new">
                <Plus className="mr-2 h-4 w-4" />
                Add New Show
              </Link>
            </Button>
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
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <span className="text-sm text-muted-foreground">
                      No Image
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1 space-y-1">
                    <CardTitle className="truncate text-lg">
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
                        id={`other-show-menu-${show.id}`}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
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
                        show.status,
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


