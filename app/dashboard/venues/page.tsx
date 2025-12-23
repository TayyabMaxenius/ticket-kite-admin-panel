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
  MapPin,
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

interface Venue {
  id: number;
  name: string;
  parent_venue: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  capacity: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  status: string | null;
  image_url: string | null;
}

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [parentFilter, setParentFilter] = useState<string>("");

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("venues")
        .select(
          "id, name, parent_venue, address, city, state, zip_code, capacity, phone, email, website, status, image_url"
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading venues:", error);
        alert("Failed to load venues: " + error.message);
        return;
      }

      setVenues(data || []);
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("Failed to load venues");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (venueId: number, venueName: string) => {
    if (!confirm(`Are you sure you want to delete "${venueName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("venues")
        .delete()
        .eq("id", venueId);

      if (error) {
        console.error("Error deleting venue:", error);
        alert("Failed to delete venue: " + error.message);
        return;
      }

      // Reload venues after deletion
      await loadVenues();
      alert("Venue deleted successfully!");
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("Failed to delete venue");
    }
  };

  const filteredVenues = venues.filter((venue) => {
    if (parentFilter && venue.parent_venue !== parentFilter) {
      return false;
    }
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const fullAddress = `${venue.address || ""} ${venue.city || ""} ${
      venue.state || ""
    } ${venue.zip_code || ""}`.toLowerCase();
    return (
      venue.name?.toLowerCase().includes(query) || fullAddress.includes(query)
    );
  });

  const formatAddress = (venue: Venue) => {
    const parts = [
      venue.address,
      venue.city,
      venue.state && venue.zip_code
        ? `${venue.state} ${venue.zip_code}`
        : venue.state || venue.zip_code,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "No address";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Venues</h1>
          <p className="text-muted-foreground">
            Manage all venues and showrooms
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/venues/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Venue
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search venues by name or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Main venue:</span>
              <select
                value={parentFilter}
                onChange={(e) => setParentFilter(e.target.value)}
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All</option>
                <option value="Alexis Park Resort">Alexis Park Resort</option>
                <option value="Ahern Live Showroom">Ahern Live Showroom</option>
                <option value="OYO Hotel & Casino">OYO Hotel & Casino</option>
                <option value="Hennessey’s Tavern Las Vegas">
                  Hennessey’s Tavern Las Vegas
                </option>
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
      {!loading && filteredVenues.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "No venues found matching your search."
                : "No venues found. Create your first venue to get started."}
            </p>
            {!searchQuery && (
              <Button asChild>
                <Link href="/dashboard/venues/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Venue
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Venues Grid */}
      {!loading && filteredVenues.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredVenues.map((venue) => (
            <Card key={venue.id} className="overflow-hidden group">
              <div className="aspect-video w-full bg-muted relative overflow-hidden">
                {venue.image_url ? (
                  <Image
                    src={venue.image_url}
                    alt={venue.name || "Venue image"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <span className="text-muted-foreground text-sm">
                      No Image
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="truncate">
                        {venue.name || "Untitled Venue"}
                      </span>
                    </CardTitle>
                    <CardDescription className="truncate">
                      {formatAddress(venue)}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        id={`venue-menu-${venue.id}`}
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
                          href={`/dashboard/venues/${venue.id}`}
                          className="flex items-center"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() =>
                          handleDelete(venue.id, venue.name || "this venue")
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="text-lg font-semibold capitalize">
                      {venue.status || "active"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Capacity</p>
                    <p className="text-2xl font-bold">
                      {venue.capacity || "N/A"}
                    </p>
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
