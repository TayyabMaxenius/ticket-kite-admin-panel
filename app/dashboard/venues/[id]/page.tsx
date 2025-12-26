"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2, ImageIcon } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { ImageSelectModal } from "./_components/ImageSelectModal";

export default function EditVenuePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [venue, setVenue] = useState({
    title: "",
    subheading: "",
    img_src: "",
    description: "",
    show_url: "",
    status: "active",
  });

  const loadVenue = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("venues")
        .select("id, title, subheading, img_src, description, show_url, status")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error loading venue:", error);
        toast.error("Failed to load venue from database: " + error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setLoading(false);
        return;
      }

      setVenue({
        title: data.title ?? "",
        subheading: data.subheading ?? "",
        img_src: data.img_src ?? "",
        description: data.description ?? "",
        show_url: data.show_url ?? "",
        status: data.status ?? "active",
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Failed to load venue");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // Load venue data if editing
    if (id && id !== "new") {
      void loadVenue();
    }
  }, [id, loadVenue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: venue.title,
        subheading: venue.subheading || null,
        img_src: venue.img_src || null,
        description: venue.description || null,
        show_url: venue.show_url || null,
        status: venue.status || "active",
      };

      let error;
      if (id === "new") {
        ({ error } = await supabase.from("venues").insert(payload));
      } else {
        ({ error } = await supabase
          .from("venues")
          .update(payload)
          .eq("id", id));
      }

      if (error) {
        console.error("Error saving venue:", error);
        toast.error("Error saving venue: " + error.message);
      } else {
        toast.success(id === "new" ? "Venue created successfully!" : "Venue updated successfully!");
        setTimeout(() => {
          router.push("/dashboard/venues");
        }, 1500);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error("Error saving venue: " + message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setVenue((prev) => ({
      ...prev,
      img_src: imageUrl,
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/venues">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {id === "new" ? "Create New Venue" : "Edit Venue"}
          </h1>
          <p className="text-muted-foreground">
            {id === "new"
              ? "Add a new venue to your listings"
              : "Update venue information"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Venue Information</CardTitle>
            <CardDescription>Enter venue details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={venue.title}
                onChange={(e) => setVenue({ ...venue, title: e.target.value })}
                required
                disabled={loading}
                placeholder="Hennessey&#8217;s Tavern Las Vegas"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subheading">Subheading</Label>
              <Input
                id="subheading"
                value={venue.subheading}
                onChange={(e) =>
                  setVenue({ ...venue, subheading: e.target.value })
                }
                disabled={loading}
                placeholder="425 Fremont St #110, Las Vegas, NV 89101"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="img_src">Image URL</Label>
              <div className="flex items-center gap-4">
                {venue.img_src && (
                  <div className="relative h-20 w-32 overflow-hidden rounded-md border bg-muted">
                    <Image
                      src={venue.img_src}
                      alt={venue.title || "Venue image"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setImageModalOpen(true)}
                  disabled={loading}
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  {venue.img_src ? "Change Image" : "Select Image"}
                </Button>
              </div>
              <Input
                id="img_src_text"
                value={venue.img_src}
                onChange={(e) =>
                  setVenue({ ...venue, img_src: e.target.value })
                }
                disabled={loading}
                placeholder="https://ticketkite.com/wp-content/uploads/2024/07/hennesseys_tavern_logo.png"
              />
              <p className="text-xs text-muted-foreground">
                Click &quot;Select Image&quot; to browse S3 bucket images or upload a new one
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={venue.description}
                onChange={(e) =>
                  setVenue({ ...venue, description: e.target.value })
                }
                disabled={loading}
                rows={6}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Hennessey's Tavern in Las Vegas is a lively pub located in the heart of Downtown. Known for its welcoming atmosphere, the tavern offers a diverse menu of delicious food, refreshing drinks, and live entertainment..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="show_url">Show URL</Label>
              <Input
                id="show_url"
                value={venue.show_url}
                onChange={(e) =>
                  setVenue({ ...venue, show_url: e.target.value })
                }
                disabled={loading}
                placeholder="hennesseys-tavern-las-vegas"
              />
              <p className="text-xs text-muted-foreground">
                URL to the venue&apos;s show page
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={venue.status}
                onChange={(e) =>
                  setVenue({ ...venue, status: e.target.value })
                }
                disabled={loading}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {id === "new" ? "Create Venue" : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </form>

      <ImageSelectModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onSelect={handleImageSelect}
        currentImageUrl={venue.img_src}
      />
    </div>
  );
}
