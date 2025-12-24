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
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function EditVenuePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [venue, setVenue] = useState({
    name: "",
    parentVenue: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    capacity: "",
    phone: "",
    email: "",
    website: "",
    status: "active",
    image: "",
    imageTitle: "",
  });

  const loadVenue = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("venues")
        .select(
          "id, name, parent_venue, address, city, state, zip_code, capacity, phone, email, website, status, image_url"
        )
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error loading venue:", error);
        alert("Failed to load venue from database: " + error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setLoading(false);
        return;
      }

      setVenue({
        name: data.name ?? "",
        parentVenue: data.parent_venue ?? "",
        address: data.address ?? "",
        city: data.city ?? "",
        state: data.state ?? "",
        zipCode: data.zip_code ?? "",
        capacity: data.capacity ? String(data.capacity) : "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        website: data.website ?? "",
        status: data.status ?? "active",
        image: data.image_url ?? "",
        imageTitle: "",
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("Failed to load venue");
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
        name: venue.name,
        parent_venue: venue.parentVenue || null,
        address: venue.address || null,
        city: venue.city || null,
        state: venue.state || null,
        zip_code: venue.zipCode || null,
        capacity: venue.capacity ? Number(venue.capacity) : null,
        phone: venue.phone || null,
        email: venue.email || null,
        website: venue.website || null,
        status: venue.status || "active",
        image_url: venue.image || null,
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
        alert("Error saving venue: " + error.message);
      } else {
        alert(
          id === "new"
            ? "Venue created successfully!"
            : "Venue updated successfully!"
        );
        router.push("/dashboard/venues");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      alert("Error saving venue: " + message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert(
        "Image size must be less than 10MB. Please choose a smaller image."
      );
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    try {
      setUploadingImage(true);

      const ext = file.name.split(".").pop() ?? "jpg";
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const filePath = `venues/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("venue-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);

        // Provide more specific error messages
        let errorMessage = "Failed to upload image. ";
        if (uploadError.message.includes("Bucket not found")) {
          errorMessage +=
            "The storage bucket 'venue-images' does not exist. Please create it in your Supabase dashboard.";
        } else if (
          uploadError.message.includes("new row violates row-level security")
        ) {
          errorMessage +=
            "Permission denied. Please check your Supabase Storage policies.";
        } else if (
          uploadError.message.includes("The resource already exists")
        ) {
          errorMessage +=
            "An image with this name already exists. Please try again.";
        } else {
          errorMessage += uploadError.message || "Please try again.";
        }

        alert(errorMessage);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("venue-images").getPublicUrl(filePath);

      setVenue((prev) => ({
        ...prev,
        image: publicUrl,
      }));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Unexpected error:", error);
      alert("Error uploading image: " + message);
    } finally {
      setUploadingImage(false);
    }
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
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Venue name and details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Venue Name *</Label>
                <Input
                  id="name"
                  value={venue.name}
                  onChange={(e) => setVenue({ ...venue, name: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="Modern Showrooms at Alexis Park Resort"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentVenue">Main Venue Section *</Label>
                <select
                  id="parentVenue"
                  value={venue.parentVenue}
                  onChange={(e) =>
                    setVenue((prev) => ({
                      ...prev,
                      parentVenue: e.target.value,
                    }))
                  }
                  required
                  disabled={loading}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select main venue...</option>
                  <option value="Alexis Park Resort">Alexis Park Resort</option>
                  <option value="Ahern Live Showroom">
                    Ahern Live Showroom
                  </option>
                  <option value="OYO Hotel & Casino">OYO Hotel & Casino</option>
                  <option value="Hennessey’s Tavern Las Vegas">
                    Hennessey’s Tavern Las Vegas
                  </option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={venue.capacity}
                  onChange={(e) =>
                    setVenue({ ...venue, capacity: e.target.value })
                  }
                  required
                  disabled={loading}
                  placeholder="300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageTitle">Venue Image Title (optional)</Label>
                <Input
                  id="imageTitle"
                  value={venue.imageTitle}
                  onChange={(e) =>
                    setVenue((prev) => ({
                      ...prev,
                      imageTitle: e.target.value,
                    }))
                  }
                  disabled={loading}
                  placeholder="Short title for this venue image"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Venue Image</Label>
                <div className="flex items-center gap-4">
                  {venue.image && !uploadingImage && (
                    <div className="relative h-20 w-32 overflow-hidden rounded-md border bg-muted">
                      <Image
                        src={venue.image}
                        alt={venue.imageTitle || venue.name || "Venue image"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    disabled={loading || uploadingImage}
                    onChange={handleImageFileChange}
                  />
                </div>
                {uploadingImage && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading image...</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Upload an image for this venue (JPG or PNG). The file will be
                  saved to Supabase Storage.
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

          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={venue.address}
                  onChange={(e) =>
                    setVenue({ ...venue, address: e.target.value })
                  }
                  required
                  disabled={loading}
                  placeholder="375 E. Harmon Ave"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={venue.city}
                    onChange={(e) =>
                      setVenue({ ...venue, city: e.target.value })
                    }
                    required
                    disabled={loading}
                    placeholder="Las Vegas"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={venue.state}
                    onChange={(e) =>
                      setVenue({ ...venue, state: e.target.value })
                    }
                    required
                    disabled={loading}
                    placeholder="NV"
                    maxLength={2}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={venue.zipCode}
                  onChange={(e) =>
                    setVenue({ ...venue, zipCode: e.target.value })
                  }
                  required
                  disabled={loading}
                  placeholder="89169"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={venue.phone}
                  onChange={(e) =>
                    setVenue({ ...venue, phone: e.target.value })
                  }
                  disabled={loading}
                  placeholder="(702) 796-3300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={venue.email}
                  onChange={(e) =>
                    setVenue({ ...venue, email: e.target.value })
                  }
                  disabled={loading}
                  placeholder="info@venue.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={venue.website}
                  onChange={(e) =>
                    setVenue({ ...venue, website: e.target.value })
                  }
                  disabled={loading}
                  placeholder="https://venue.com"
                />
              </div>
            </CardContent>
          </Card>
        </div>

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
    </div>
  );
}
