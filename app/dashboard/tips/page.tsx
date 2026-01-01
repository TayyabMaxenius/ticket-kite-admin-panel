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
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type Tip = {
  id: number;
  title: string;
  img_src: string | null;
  post_slug: string | null;
  post_url: string | null;
};

const PAGE_SIZE = 15;

export default function TipsAndTricksPage() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    loadTips();
  }, []);

  useEffect(() => {
    // Reset visible count when search query changes
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery]);

  const loadTips = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tips")
        .select("id, title, img_src, post_slug, post_url")
        .order("id", { ascending: false });

      if (error) {
        console.error("Error loading tips:", error);
        alert("Failed to load tips: " + error.message);
        return;
      }

      setTips(data || []);
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("Failed to load tips");
    } finally {
      setLoading(false);
    }
  };

  const filteredTips = tips.filter((tip) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      tip.title?.toLowerCase().includes(q) ||
      tip.post_slug?.toLowerCase().includes(q)
    );
  });

  const displayedTips = filteredTips.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTips.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tips &amp; Tricks
          </h1>
          <p className="text-muted-foreground">
            Manage all your tips, guides, and helpful articles
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter tips</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tips by title or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
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

      {/* Empty state */}
      {!loading && filteredTips.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "No tips found matching your search."
                : "No tips found. Create your first tip to get started."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tips grid - Shows tips with pagination */}
      {!loading && displayedTips.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayedTips.map((tip) => (
              <Card key={tip.id} className="overflow-hidden group">
                <div className="aspect-[4/3] w-full bg-muted relative overflow-hidden">
                  {tip.img_src &&
                  tip.img_src !== "false" &&
                  typeof tip.img_src === "string" ? (
                    <Image
                      src={tip.img_src}
                      alt={tip.title || "Tip image"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                      <span className="text-muted-foreground text-xs">
                        No Image
                      </span>
                    </div>
                  )}
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base truncate">
                    {tip.title || "Untitled Tip"}
                  </CardTitle>
                  {tip.post_slug && (
                    <CardDescription className="truncate text-xs mt-1">
                      {tip.post_slug}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`https://ticketkite.com/${tip.post_url || ""}`}
                        target="_blank"
                      >
                        View on site
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <Button onClick={handleLoadMore} variant="outline" size="lg">
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
