"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
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
import { ArrowLeft, Save, Loader2, Plus, X } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function EditShowPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isNew = id === "new";
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState("");
  const [show, setShow] = useState({
    // Basic Info
    name: "",
    description: "",
    short_description: "",
    product_url: "",
    product_slug: "",

    // Pricing
    price: "",
    discountedPrice: "",
    percentage_fee: "",

    // Images
    image_url: "",
    cover_image: "",
    portrait_image: "",

    // Venue & Category
    venue_name: "",
    category: "",

    // Status
    status: "active",

    // Duration
    duration: "",

    // Story content (extracted from story.description)
    story_description: "",

    // Additional fields
    series_id: "",
    series_code: "",
    nliven_token: "",
    nliven_promo_code: "",

    // JSON fields
    categories: [] as Array<{ term_id: number; name: string }>,
    tags: [] as Array<{ term_id: number; name: string }>,
    show_features: null as Record<string, unknown> | null,
    story: null as Record<string, unknown> | null,
    venue_details: null as Record<string, unknown> | null,
    additional_info: null as Record<string, unknown> | null,
    cast_members: [] as Array<{
      title: string;
      description: string;
      img_url: string;
    }>,
    gallery_images: [] as string[],

    // Yoast SEO fields (extracted for easy editing)
    yoast_focuskw: "",
    yoast_metadesc: "",
    yoast_title: "",
    yoast_seo: null as Record<string, unknown> | null,
  });

  const loadShow = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("shows")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error loading show:", error);
        alert("Failed to load show from database: " + error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setLoading(false);
        return;
      }

      setShow({
        name: data.name ?? "",
        description: data.description ?? "",
        short_description: data.short_description ?? "",
        product_url: data.product_url ?? "",
        product_slug: data.product_slug ?? "",
        price: data.price ? String(data.price) : "",
        discountedPrice: data.discounted_price
          ? String(data.discounted_price)
          : "",
        percentage_fee: data.percentage_fee ?? "",
        image_url: data.image_url ?? "",
        cover_image: data.cover_image ?? "",
        portrait_image: data.portrait_image ?? "",
        venue_name: data.venue_name ?? "",
        category: data.category ?? "",
        status: data.status ?? "active",
        duration: data.duration_minutes ?? "",
        story_description:
          (data.story as { description?: string } | null)?.description ??
          (data.additional_info as { story?: { description?: string } } | null)
            ?.story?.description ??
          "",
        series_id: data.series_id ?? "",
        series_code: data.series_code ?? "",
        nliven_token: data.nliven_token ?? "",
        nliven_promo_code: data.nliven_promo_code ?? "",
        categories: Array.isArray(data.categories) ? data.categories : [],
        tags: Array.isArray(data.tags) ? data.tags : [],
        show_features:
          data.show_features ||
          (data.additional_info as { show_features?: unknown } | null)
            ?.show_features ||
          null,
        story:
          data.story ||
          (data.additional_info as { story?: unknown } | null)?.story ||
          null,
        venue_details:
          data.venue_details ||
          (data.additional_info as { venue?: unknown } | null)?.venue ||
          null,
        additional_info: data.additional_info || null,
        cast_members: Array.isArray(data.cast_members)
          ? data.cast_members
          : (
              data.story as {
                cast?: {
                  details?: Array<{
                    title?: string;
                    description?: string;
                    img_url?: string;
                  }>;
                };
              } | null
            )?.cast?.details || [],
        gallery_images:
          Array.isArray(data.gallery_images) && data.gallery_images.length > 0
            ? data.gallery_images
            : (((
                data.story as {
                  media?: { details?: { images?: string[] } };
                } | null
              )?.media?.details?.images || []) as string[]),
        yoast_focuskw:
          (
            (data.yoast_seo ||
              (
                data.additional_info as {
                  yoast?: { yoast_wpseo_focuskw?: string };
                } | null
              )?.yoast) as { yoast_wpseo_focuskw?: string } | null
          )?.yoast_wpseo_focuskw ?? "",
        yoast_metadesc:
          (
            (data.yoast_seo ||
              (
                data.additional_info as {
                  yoast?: { yoast_wpseo_metadesc?: string };
                } | null
              )?.yoast) as { yoast_wpseo_metadesc?: string } | null
          )?.yoast_wpseo_metadesc ?? "",
        yoast_title:
          (
            (data.yoast_seo ||
              (
                data.additional_info as {
                  yoast?: { yoast_wpseo_title?: string };
                } | null
              )?.yoast) as { yoast_wpseo_title?: string } | null
          )?.yoast_wpseo_title ?? "",
        yoast_seo:
          data.yoast_seo ||
          (data.additional_info as { yoast?: unknown } | null)?.yoast ||
          null,
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("Failed to load show");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!isNew) {
      void loadShow();
    }
  }, [isNew, loadShow]);

  const handleImageUpload = async (
    file: File,
    imageType: "image_url" | "cover_image" | "portrait_image"
  ) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert(
        "Image size must be less than 10MB. Please choose a smaller image."
      );
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    try {
      setUploadingImage(imageType);
      const ext = file.name.split(".").pop() ?? "jpg";
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const filePath = `shows/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("show-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        alert("Failed to upload image: " + uploadError.message);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("show-images").getPublicUrl(filePath);

      setShow((prev) => ({
        ...prev,
        [imageType]: publicUrl,
      }));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Unexpected error:", error);
      alert("Error uploading image: " + message);
    } finally {
      setUploadingImage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        name: show.name,
        description: show.description || null,
        short_description: show.short_description || null,
        product_url: show.product_url || null,
        product_slug: show.product_slug || null,
        price: show.price ? Number(show.price) : null,
        discounted_price: show.discountedPrice
          ? Number(show.discountedPrice)
          : null,
        percentage_fee: show.percentage_fee || null,
        image_url: show.image_url || null,
        cover_image: show.cover_image || null,
        portrait_image: show.portrait_image || null,
        venue_name: show.venue_name || null,
        category: show.category || null,
        status: show.status || "active",
        duration_minutes: show.duration || null,
        series_id: show.series_id || null,
        series_code: show.series_code || null,
        nliven_token: show.nliven_token || null,
        nliven_promo_code: show.nliven_promo_code || null,
        categories: show.categories.length > 0 ? show.categories : null,
        tags: show.tags.length > 0 ? show.tags : null,
        show_features: show.show_features,
        story: show.story_description
          ? {
              ...(show.story || {}),
              description: show.story_description,
              media:
                show.gallery_images.length > 0
                  ? {
                      ...((
                        show.story as { media?: Record<string, unknown> } | null
                      )?.media || {}),
                      details: {
                        ...((
                          show.story as {
                            media?: { details?: Record<string, unknown> };
                          } | null
                        )?.media?.details || {}),
                        images: show.gallery_images,
                      },
                    }
                  : (show.story as { media?: unknown } | null)?.media,
            }
          : show.story,
        venue_details: show.venue_details,
        additional_info: show.additional_info
          ? {
              ...(show.additional_info as Record<string, unknown>),
              yoast: show.yoast_seo,
            }
          : show.yoast_seo
          ? { yoast: show.yoast_seo }
          : null,
        cast_members: show.cast_members.length > 0 ? show.cast_members : null,
        gallery_images:
          show.gallery_images.length > 0 ? show.gallery_images : null,
        yoast_seo:
          show.yoast_focuskw || show.yoast_metadesc || show.yoast_title
            ? {
                ...((show.yoast_seo as Record<string, unknown>) || {}),
                yoast_wpseo_focuskw: show.yoast_focuskw || undefined,
                yoast_wpseo_metadesc: show.yoast_metadesc || undefined,
                yoast_wpseo_title: show.yoast_title || undefined,
              }
            : show.yoast_seo,
      };

      let error;
      if (isNew) {
        ({ error } = await supabase.from("shows").insert(payload));
      } else {
        ({ error } = await supabase.from("shows").update(payload).eq("id", id));
      }

      if (error) {
        console.error("Error saving show:", error);
        alert("Error saving show: " + error.message);
      } else {
        alert(
          isNew ? "Show created successfully!" : "Show updated successfully!"
        );
        router.push("/dashboard/shows");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      alert("Error saving show: " + message);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = () => {
    const name = prompt("Enter category name:");
    if (name) {
      setShow((prev) => ({
        ...prev,
        categories: [...prev.categories, { term_id: Date.now(), name }],
      }));
    }
  };

  const removeCategory = (index: number) => {
    setShow((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    const name = prompt("Enter tag name:");
    if (name) {
      setShow((prev) => ({
        ...prev,
        tags: [...prev.tags, { term_id: Date.now(), name }],
      }));
    }
  };

  const removeTag = (index: number) => {
    setShow((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const addGalleryImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      setShow((prev) => ({
        ...prev,
        gallery_images: [...prev.gallery_images, url],
      }));
    }
  };

  const removeGalleryImage = (index: number) => {
    setShow((prev) => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/shows">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {id === "new" ? "Create New Show" : "Edit Show"}
          </h1>
          <p className="text-muted-foreground">
            {id === "new"
              ? "Add a new show to your listings"
              : "Update show information"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Show name, descriptions, and URLs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Show Name *</Label>
              <Input
                id="name"
                value={show.name}
                onChange={(e) => setShow({ ...show, name: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="short_description">Short Description</Label>
              <textarea
                id="short_description"
                value={show.short_description}
                onChange={(e) =>
                  setShow({ ...show, short_description: e.target.value })
                }
                disabled={loading}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Full Description</Label>
              <textarea
                id="description"
                value={show.description}
                onChange={(e) =>
                  setShow({ ...show, description: e.target.value })
                }
                disabled={loading}
                rows={6}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product_url">Product URL</Label>
                <Input
                  id="product_url"
                  value={show.product_url}
                  onChange={(e) =>
                    setShow({ ...show, product_url: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_slug">Product Slug</Label>
                <Input
                  id="product_slug"
                  value={show.product_slug}
                  onChange={(e) =>
                    setShow({ ...show, product_slug: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
            <CardDescription>Main, cover, and portrait images</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Main Image */}
              <div className="space-y-2">
                <Label htmlFor="main_image">Main Image (800x533)</Label>
                <Input
                  id="main_image"
                  type="file"
                  accept="image/*"
                  disabled={loading || uploadingImage === "image_url"}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, "image_url");
                  }}
                />
                {uploadingImage === "image_url" && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                )}
                {show.image_url && !uploadingImage && (
                  <div className="relative mt-2 h-32 w-full overflow-hidden rounded-md border bg-muted">
                    <Image
                      src={show.image_url}
                      alt="Main image"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <Input
                  value={show.image_url}
                  onChange={(e) =>
                    setShow({ ...show, image_url: e.target.value })
                  }
                  className="mt-2"
                />
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <Label htmlFor="cover_image">Cover Image (1924x500)</Label>
                <Input
                  id="cover_image"
                  type="file"
                  accept="image/*"
                  disabled={loading || uploadingImage === "cover_image"}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, "cover_image");
                  }}
                />
                {uploadingImage === "cover_image" && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                )}
                {show.cover_image && !uploadingImage && (
                  <div className="relative mt-2 h-32 w-full overflow-hidden rounded-md border bg-muted">
                    <Image
                      src={show.cover_image}
                      alt="Cover image"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <Input
                  value={show.cover_image}
                  onChange={(e) =>
                    setShow({ ...show, cover_image: e.target.value })
                  }
                  className="mt-2"
                />
              </div>

              {/* Portrait Image */}
              <div className="space-y-2">
                <Label htmlFor="portrait_image">Portrait Image (326x444)</Label>
                <Input
                  id="portrait_image"
                  type="file"
                  accept="image/*"
                  disabled={loading || uploadingImage === "portrait_image"}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, "portrait_image");
                  }}
                />
                {uploadingImage === "portrait_image" && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                )}
                {show.portrait_image && !uploadingImage && (
                  <div className="relative mt-2 h-32 w-full overflow-hidden rounded-md border bg-muted">
                    <Image
                      src={show.portrait_image}
                      alt="Portrait image"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <Input
                  value={show.portrait_image}
                  onChange={(e) =>
                    setShow({ ...show, portrait_image: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Venue */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price">Regular Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={show.price}
                  onChange={(e) => setShow({ ...show, price: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountedPrice">Sale Price ($)</Label>
                <Input
                  id="discountedPrice"
                  type="number"
                  step="0.01"
                  value={show.discountedPrice}
                  onChange={(e) =>
                    setShow({ ...show, discountedPrice: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="percentage_fee">Percentage Fee (%)</Label>
                <Input
                  id="percentage_fee"
                  value={show.percentage_fee}
                  onChange={(e) =>
                    setShow({ ...show, percentage_fee: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={show.duration}
                  onChange={(e) =>
                    setShow({ ...show, duration: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Venue & Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="venue_name">Venue *</Label>
                <select
                  id="venue_name"
                  value={show.venue_name}
                  onChange={(e) =>
                    setShow({ ...show, venue_name: e.target.value })
                  }
                  required
                  disabled={loading}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select venue...</option>
                  <option value="Alexis Park Resort">Alexis Park Resort</option>
                  <option value="Ahern Live Showroom">
                    Ahern Live Showroom
                  </option>
                  <option value="OYO Hotel & Casino">OYO Hotel & Casino</option>
                  <option value="Hennessey's Tavern Las Vegas">
                    Hennessey&apos;s Tavern Las Vegas
                  </option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Primary Category</Label>
                <Input
                  id="category"
                  value={show.category}
                  onChange={(e) =>
                    setShow({ ...show, category: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={show.status}
                  onChange={(e) => setShow({ ...show, status: e.target.value })}
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
        </div>

        {/* Categories & Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Categories & Tags</CardTitle>
            <CardDescription>Add multiple categories and tags</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Categories</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCategory}
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Category
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {show.categories.map((cat, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-muted px-3 py-1 rounded-md text-sm"
                  >
                    <span>{cat.name}</span>
                    <button
                      type="button"
                      onClick={() => removeCategory(index)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Tags</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTag}
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Tag
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {show.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-muted px-3 py-1 rounded-md text-sm"
                  >
                    <span>{tag.name}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>
              Series codes, tokens, and promo codes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="series_id">Series ID</Label>
                <Input
                  id="series_id"
                  value={show.series_id}
                  onChange={(e) =>
                    setShow({ ...show, series_id: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="series_code">Series Code</Label>
                <Input
                  id="series_code"
                  value={show.series_code}
                  onChange={(e) =>
                    setShow({ ...show, series_code: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nliven_token">NLiven Token</Label>
                <Input
                  id="nliven_token"
                  value={show.nliven_token}
                  onChange={(e) =>
                    setShow({ ...show, nliven_token: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nliven_promo_code">NLiven Promo Code</Label>
                <Input
                  id="nliven_promo_code"
                  value={show.nliven_promo_code}
                  onChange={(e) =>
                    setShow({ ...show, nliven_promo_code: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Story Content */}
        <Card>
          <CardHeader>
            <CardTitle>Story / Detailed Content</CardTitle>
            <CardDescription>
              Full detailed story and content for the show (supports HTML)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="story_description">Story Description</Label>
              <textarea
                id="story_description"
                value={show.story_description}
                onChange={(e) =>
                  setShow({ ...show, story_description: e.target.value })
                }
                disabled={loading}
                rows={12}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                This content supports HTML formatting. The story content will be
                saved in the story.description field.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Gallery Images */}
        <Card>
          <CardHeader>
            <CardTitle>Gallery Images</CardTitle>
            <CardDescription>
              Add multiple images for the show gallery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={addGalleryImage}
              disabled={loading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Gallery Image URL
            </Button>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {show.gallery_images.map((url, index) => (
                <div key={index} className="relative group">
                  <div className="relative h-32 w-full overflow-hidden rounded-md border bg-muted">
                    <Image
                      src={url}
                      alt={`Gallery image ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Yoast SEO */}
        <Card>
          <CardHeader>
            <CardTitle>Yoast SEO</CardTitle>
            <CardDescription>
              Search engine optimization settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="yoast_focuskw">Focus Keyword</Label>
              <Input
                id="yoast_focuskw"
                value={show.yoast_focuskw}
                onChange={(e) =>
                  setShow({ ...show, yoast_focuskw: e.target.value })
                }
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yoast_metadesc">Meta Description</Label>
              <textarea
                id="yoast_metadesc"
                value={show.yoast_metadesc}
                onChange={(e) =>
                  setShow({ ...show, yoast_metadesc: e.target.value })
                }
                disabled={loading}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground">
                Recommended length: 120-160 characters
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="yoast_title">SEO Title</Label>
              <Input
                id="yoast_title"
                value={show.yoast_title}
                onChange={(e) =>
                  setShow({ ...show, yoast_title: e.target.value })
                }
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Use %%title%% to insert the show title, %%sep%% for separator
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-4">
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
                {id === "new" ? "Create Show" : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
