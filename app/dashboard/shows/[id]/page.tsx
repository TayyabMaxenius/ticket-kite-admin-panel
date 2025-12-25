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
import { CategoryModal } from "./_components/CategoryModal";
import { TagModal } from "./_components/TagModal";
import { ShowFeatureModal } from "./_components/ShowFeatureModal";
import { CastMemberModal } from "./_components/CastMemberModal";
import { VenueDetailModal } from "./_components/VenueDetailModal";
import { GalleryMediaModal } from "./_components/GalleryMediaModal";
import { Toast } from "./_components/Toast";
import { showTemplateData } from "./_components/showTemplateData";

export default function EditShowPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isNew = id === "new";
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState("");
  const [venues, setVenues] = useState<Array<{ id: number; name: string }>>([]);

  // Modal states
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [showFeatureModalOpen, setShowFeatureModalOpen] = useState(false);
  const [castMemberModalOpen, setCastMemberModalOpen] = useState(false);
  const [venueDetailModalOpen, setVenueDetailModalOpen] = useState(false);
  const [galleryImageModalOpen, setGalleryImageModalOpen] = useState(false);
  const [galleryVideoModalOpen, setGalleryVideoModalOpen] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [show, setShow] = useState({
    // Basic Info
    name: "",
    description: "",
    short_description: "",
    product_url: "",
    product_slug: "",
    product_id: "",
    currency_symbol: "&#36;",
    review_count: "0",

    // Pricing
    price: "",
    discountedPrice: "",
    percentage_fee: "",

    // Images
    image_url: "",
    cover_image: "",
    portrait_image: "",

    // Venue & Category
    venue_id: null as number | null,
    venue_name: "",
    category: "",

    // Status
    status: "active",

    // Duration
    duration: "",

    // Story content
    story_description: "",
    story_title: "",
    story_sub_title: "",
    story_enable_description: "yes",

    // Additional fields
    series_id: "",
    series_code: "",
    nliven_token: "",
    nliven_promo_code: "",

    // JSON fields
    categories: [] as Array<{ term_id: number; name: string }>,
    tags: [] as Array<{ term_id: number; name: string }>,
    show_features: null as {
      title?: string;
      length?: string;
      details?: Array<{
        title: string;
        description: string;
        img_url: string;
      }>;
      tags?: {
        length?: string;
        details?: unknown[];
      };
    } | null,
    story: null as Record<string, unknown> | null,
    venue_details: null as Record<string, unknown> | null,
    additional_info: null as Record<string, unknown> | null,
    cast_members: [] as Array<{
      title: string;
      description: string;
      img_url: string;
    }>,
    gallery_images: [] as string[],
    gallery_videos: [] as string[],

    // Venue fields
    venue_title: "",
    venue_sub_title: "",
    venue_description: "",
    venue_enable_venue: "yes",
    venue_img_url: "",
    venue_link: "",
    venue_google_map: "",
    venue_seat_map: "",
    venue_series_data: null as Record<string, unknown> | null,
    venue_details_array: [] as Array<{
      title: string;
      description: string;
      link_url: string;
      img_url: string;
    }>,

    // Show Features details
    show_features_title: "",
    show_features_details: [] as Array<{
      title: string;
      description: string;
      img_url: string;
    }>,

    // Yoast SEO fields
    yoast_focuskw: "",
    yoast_focuskeywords: "",
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
        setToast({ message: "Failed to load show from database: " + error.message, type: "error" });
        setLoading(false);
        return;
      }

      if (!data) {
        setLoading(false);
        return;
      }

      // Extract data from JSONB field or fallback to root level (for backward compatibility)
      const showData = (data.data as Record<string, unknown> | null) || data;

      // Use column values if available, otherwise fallback to JSONB data
      const titleValue = (data.title as string | undefined) || (showData.title as string | undefined) || (showData.name as string | undefined) || "";
      const productSlugValue = (data.product_slug as string | undefined) || (showData.product_slug as string | undefined) || "";
      const productIdValue = (data.product_id as number | undefined) || (showData.product_id as number | undefined);
      const seriesIdValue = (data.series_id as string | undefined) || (showData.series_id as string | undefined) || "";
      const seriesCodeValue = (data.series_code as string | undefined) || (showData.series_code as string | undefined) || "";

      // Extract additional_info if it exists
      const additionalInfo = (showData.additional_info as {
        show_features?: unknown;
        story?: unknown;
        venue?: unknown;
        yoast?: unknown;
      } | null) || {};

      const showFeatures = showData.show_features || additionalInfo.show_features || null;
      const storyData = showData.story || additionalInfo.story || null;
      const venueData = showData.venue_details || additionalInfo.venue || null;
      const yoastData = showData.yoast_seo || additionalInfo.yoast || null;

      setShow({
        name: titleValue,
        description: (showData.description ?? "") as string,
        short_description: (showData.short_description ?? "") as string,
        product_url: (showData.product_url ?? "") as string,
        product_slug: productSlugValue,
        product_id: productIdValue ? String(productIdValue) : "",
        currency_symbol: (showData.currency_symbol as string | undefined) ?? "&#36;",
        review_count: (showData.review_count as number | string | undefined)?.toString() ?? "0",
        price: (showData.regular_price as string | number | undefined) ? String(showData.regular_price) : ((showData.price as number | undefined) ? String(showData.price) : ""),
        discountedPrice: (showData.sale_price as string | number | undefined) ? String(showData.sale_price) : ((showData.discounted_price as number | undefined) ? String(showData.discounted_price) : ""),
        percentage_fee: (showData.percentage_fee ?? "") as string,
        image_url: (showData.img_src ?? showData.image_url ?? "") as string,
        cover_image: (showData.cover_image ?? "") as string,
        portrait_image: (showData.portrait_image ?? "") as string,
        venue_id: (data.venue_id as number | null) || null,
        venue_name: (showData.venue_name ?? "") as string,
        category: (showData.category ?? "") as string,
        status: (data.status ?? "active") as string,
        duration: (showData.duration_minutes ?? "") as string,
        story_description: (storyData as { description?: string } | null)?.description ?? "",
        story_title: (storyData as { title?: string } | null)?.title ?? "",
        story_sub_title: (storyData as { sub_title?: string } | null)?.sub_title ?? "",
        story_enable_description: (storyData as { enable_description?: string } | null)?.enable_description ?? "yes",
        series_id: seriesIdValue,
        series_code: seriesCodeValue,
        nliven_token: (showData.nliven_token ?? "") as string,
        nliven_promo_code: (showData.nliven_promo_code ?? "") as string,
        categories: Array.isArray(showData.categories) ? (showData.categories as Array<{ term_id: number; name: string }>) : [],
        tags: Array.isArray(showData.tags) ? (showData.tags as Array<{ term_id: number; name: string }>) : [],
        show_features: showFeatures,
        story: storyData,
        venue_details: venueData,
        additional_info: showData.additional_info || null,
        cast_members: Array.isArray(showData.cast_members)
          ? ((showData.cast_members as Array<{ title?: string; description?: string; img_url?: string }>).map(item => ({
            title: item.title || "",
            description: item.description || "",
            img_url: item.img_url || "",
          })))
          : ((storyData as { cast?: { details?: Array<{ title?: string; description?: string; img_url?: string }> } } | null)?.cast?.details?.map(item => ({
            title: item.title || "",
            description: item.description || "",
            img_url: item.img_url || "",
          })) || []),
        gallery_images: Array.isArray(showData.gallery_images) && showData.gallery_images.length > 0
          ? (showData.gallery_images as string[])
          : (((storyData as { media?: { details?: { images?: string[] } } } | null)?.media?.details?.images || []) as string[]),
        gallery_videos: ((storyData as { media?: { details?: { videos?: string[] } } } | null)?.media?.details?.videos || []) as string[],

        // Venue fields
        venue_title: (venueData as { title?: string } | null)?.title ?? "",
        venue_sub_title: (venueData as { sub_title?: string } | null)?.sub_title ?? "",
        venue_description: (venueData as { description?: string } | null)?.description ?? "",
        venue_enable_venue: (venueData as { enable_venue?: string } | null)?.enable_venue ?? "yes",
        venue_img_url: (venueData as { img_url?: string } | null)?.img_url ?? "",
        venue_link: (venueData as { venue_link?: string } | null)?.venue_link ?? "",
        venue_google_map: (venueData as { google_map?: string } | null)?.google_map ?? "",
        venue_seat_map: (venueData as { seat_map?: string } | null)?.seat_map ?? "",
        venue_series_data: (venueData as { venue_series_data?: unknown } | null)?.venue_series_data
          ? (venueData as { venue_series_data: Record<string, unknown> }).venue_series_data as Record<string, unknown>
          : null,
        venue_details_array: Array.isArray((venueData as { details?: unknown[] } | null)?.details)
          ? ((venueData as { details: Array<{ title?: string; description?: string; link_url?: string; img_url?: string }> }).details.map(item => ({
            title: item.title || "",
            description: item.description || "",
            link_url: item.link_url || "",
            img_url: item.img_url || "",
          })))
          : [],

        // Show Features
        show_features_title: (showFeatures as { title?: string } | null)?.title ?? "",
        show_features_details: Array.isArray((showFeatures as { details?: unknown[] } | null)?.details)
          ? ((showFeatures as { details: Array<{ title?: string; description?: string; img_url?: string }> }).details.map(item => ({
            title: item.title || "",
            description: item.description || "",
            img_url: item.img_url || "",
          })))
          : [],

        // Yoast SEO fields
        yoast_focuskw: (yoastData as { yoast_wpseo_focuskw?: string } | null)?.yoast_wpseo_focuskw ?? "",
        yoast_focuskeywords: (yoastData as { yoast_wpseo_focuskeywords?: string } | null)?.yoast_wpseo_focuskeywords ?? "",
        yoast_metadesc: (yoastData as { yoast_wpseo_metadesc?: string } | null)?.yoast_wpseo_metadesc ?? "",
        yoast_title: (yoastData as { yoast_wpseo_title?: string } | null)?.yoast_wpseo_title ?? "",
        yoast_seo: yoastData,
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      setToast({ message: "Failed to load show", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Load venues for dropdown
  useEffect(() => {
    const loadVenues = async () => {
      try {
        const { data, error } = await supabase
          .from("venues")
          .select("id, name")
          .eq("status", "active")
          .order("name", { ascending: true });

        if (error) {
          console.error("Error loading venues:", error);
          return;
        }

        setVenues((data || []).map(v => ({ id: v.id, name: v.name })));
      } catch (error) {
        console.error("Error loading venues:", error);
      }
    };

    void loadVenues();
  }, []);

  useEffect(() => {
    if (!isNew) {
      void loadShow();
    } else {
      // Pre-fill form with template data when creating a new show
      setShow({
        ...showTemplateData,
        story: null,
        venue_details: null,
        additional_info: null,
      });
    }
  }, [isNew, loadShow]);

  const handleImageUpload = async (
    file: File,
    imageType: "image_url" | "cover_image" | "portrait_image"
  ) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setToast({ message: "Image size must be less than 10MB. Please choose a smaller image.", type: "error" });
      return;
    }

    if (!file.type.startsWith("image/")) {
      setToast({ message: "Please select a valid image file.", type: "error" });
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
        setToast({ message: "Failed to upload image: " + uploadError.message, type: "error" });
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
      setToast({ message: "Error uploading image: " + message, type: "error" });
    } finally {
      setUploadingImage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Build show_features object
      const showFeaturesObj = {
        title: show.show_features_title || "",
        length: String(show.show_features_details.length),
        details: show.show_features_details,
        tags: {
          length: "",
          details: [],
        },
      };

      // Build story object
      const storyObj = {
        title: show.story_title || "",
        description: show.story_description || "",
        sub_title: show.story_sub_title || "",
        enable_description: show.story_enable_description || "yes",
        media: {
          length: String(show.gallery_images.length + show.gallery_videos.length),
          details: {
            images: show.gallery_images,
            videos: show.gallery_videos,
          },
        },
        cast: {
          length: String(show.cast_members.length),
          details: show.cast_members,
        },
      };

      // Build venue object
      const venueObj = {
        title: show.venue_title || "",
        sub_title: show.venue_sub_title || "",
        description: show.venue_description || "",
        enable_venue: show.venue_enable_venue || "yes",
        img_url: show.venue_img_url || "",
        venue_link: show.venue_link || "",
        length: String(show.venue_details_array.length),
        venue_series_data: show.venue_series_data,
        google_map: show.venue_google_map || "",
        seat_map: show.venue_seat_map || "",
        details: show.venue_details_array,
      };

      // Build yoast object
      const yoastObj: Record<string, unknown> = {};
      if (show.yoast_focuskw) yoastObj.yoast_wpseo_focuskw = show.yoast_focuskw;
      if (show.yoast_focuskeywords) yoastObj.yoast_wpseo_focuskeywords = show.yoast_focuskeywords;
      if (show.yoast_metadesc) yoastObj.yoast_wpseo_metadesc = show.yoast_metadesc;
      if (show.yoast_title) yoastObj.yoast_wpseo_title = show.yoast_title;

      // Build additional_info object matching the JSON structure
      const additionalInfo = {
        show_features: showFeaturesObj,
        story: storyObj,
        venue: venueObj,
        yoast: Object.keys(yoastObj).length > 0 ? yoastObj : undefined,
      };

      // Build data object matching your JSON structure exactly
      const showData = {
        product_id: show.product_id ? Number(show.product_id) : null,
        series_id: show.series_id || null,
        nliven_token: show.nliven_token || null,
        nliven_promo_code: show.nliven_promo_code || null,
        title: show.name || null,
        percentage_fee: show.percentage_fee || null,
        product_url: show.product_url || null,
        product_slug: show.product_slug || null,
        description: show.description || null,
        short_description: show.short_description || null,
        currency_symbol: show.currency_symbol || "&#36;",
        regular_price: show.price || null,
        sale_price: show.discountedPrice || null,
        img_src: show.image_url || null,
        cover_image: show.cover_image || null,
        portrait_image: show.portrait_image || null,
        series_code: show.series_code || null,
        categories: show.categories.length > 0 ? show.categories : [],
        tags: show.tags.length > 0 ? show.tags : [],
        review_count: show.review_count ? Number(show.review_count) : 0,
        additional_info: additionalInfo,
      };

      // Check for duplicate show before saving
      // Check if any show exists with the same title, product_id, series_id, or series_code
      let duplicateFound = null;
      const duplicateFields: string[] = [];

      // Check each field separately
      if (show.name && show.name.trim()) {
        let titleQuery = supabase
          .from("shows")
          .select("id, title, product_id, series_id, series_code")
          .eq("title", show.name)
          .limit(1);
        if (!isNew && id) {
          titleQuery = titleQuery.neq("id", id);
        }
        const { data: titleDup } = await titleQuery;
        if (titleDup && titleDup.length > 0) {
          duplicateFound = titleDup[0];
          duplicateFields.push("Title");
        }
      }

      if (!duplicateFound && show.product_id) {
        let productIdQuery = supabase
          .from("shows")
          .select("id, title, product_id, series_id, series_code")
          .eq("product_id", Number(show.product_id))
          .limit(1);
        if (!isNew && id) {
          productIdQuery = productIdQuery.neq("id", id);
        }
        const { data: productIdDup } = await productIdQuery;
        if (productIdDup && productIdDup.length > 0) {
          duplicateFound = productIdDup[0];
          duplicateFields.push("Product ID");
        }
      }

      if (!duplicateFound && show.series_id && show.series_id.trim()) {
        let seriesIdQuery = supabase
          .from("shows")
          .select("id, title, product_id, series_id, series_code")
          .eq("series_id", show.series_id)
          .limit(1);
        if (!isNew && id) {
          seriesIdQuery = seriesIdQuery.neq("id", id);
        }
        const { data: seriesIdDup } = await seriesIdQuery;
        if (seriesIdDup && seriesIdDup.length > 0) {
          duplicateFound = seriesIdDup[0];
          duplicateFields.push("Series ID");
        }
      }

      if (!duplicateFound && show.series_code && show.series_code.trim()) {
        let seriesCodeQuery = supabase
          .from("shows")
          .select("id, title, product_id, series_id, series_code")
          .eq("series_code", show.series_code)
          .limit(1);
        if (!isNew && id) {
          seriesCodeQuery = seriesCodeQuery.neq("id", id);
        }
        const { data: seriesCodeDup } = await seriesCodeQuery;
        if (seriesCodeDup && seriesCodeDup.length > 0) {
          duplicateFound = seriesCodeDup[0];
          duplicateFields.push("Series Code");
        }
      }

      if (duplicateFound) {
        setToast({
          message: `A show with the same ${duplicateFields.join(", ")} already exists (Show ID: ${duplicateFound.id}). Please use different values.`,
          type: "error",
        });
        setLoading(false);
        return;
      }


      // Build the final payload - minimal columns for filtering + data JSONB
      // Schema: id, venue_id, status, product_slug, product_id, series_id, title, series_code, data (JSONB)
      const payload: Record<string, unknown> = {
        venue_id: show.venue_id || null,
        status: show.status || "active",
        // Keep frequently queried fields as columns for fast filtering
        product_slug: show.product_slug || null,
        product_id: show.product_id ? Number(show.product_id) : null,
        series_id: show.series_id || null,
        title: show.name || null,
        series_code: show.series_code || null,
        // All data in JSONB
        data: showData,
      };

      let error;
      if (isNew) {
        // Don't include id in insert - let PostgreSQL auto-generate it
        const { data: insertedData, error: insertError } = await supabase
          .from("shows")
          .insert(payload)
          .select()
          .single();
        error = insertError;
        if (!error && insertedData) {
          // Redirect to the newly created show's edit page
          router.push(`/dashboard/shows/${insertedData.id}`);
        }
      } else {
        console.log("payload", payload);
        ({ error } = await supabase.from("shows").update(payload).eq("id", id));
      }

      if (error) {
        console.error("Error saving show:", error);
        setToast({ message: "Error saving show: " + error.message, type: "error" });
      } else {
        setToast({
          message: isNew ? "Show created successfully!" : "Show updated successfully!",
          type: "success",
        });
        setTimeout(() => {
          router.push("/dashboard/shows");
        }, 1500);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      setToast({ message: "Error saving show: " + message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = (name: string) => {
    setShow((prev) => ({
      ...prev,
      categories: [...prev.categories, { term_id: Date.now(), name }],
    }));
  };

  const removeCategory = (index: number) => {
    setShow((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index),
    }));
  };

  const handleAddTag = (name: string) => {
    setShow((prev) => ({
      ...prev,
      tags: [...prev.tags, { term_id: Date.now(), name }],
    }));
  };

  const removeTag = (index: number) => {
    setShow((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleAddGalleryMedia = (url: string, type: "image" | "video") => {
    if (type === "image") {
      setShow((prev) => ({
        ...prev,
        gallery_images: [...prev.gallery_images, url],
      }));
    } else {
      setShow((prev) => ({
        ...prev,
        gallery_videos: [...prev.gallery_videos, url],
      }));
    }
  };

  const removeGalleryImage = (index: number) => {
    setShow((prev) => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index),
    }));
  };


  const removeGalleryVideo = (index: number) => {
    setShow((prev) => ({
      ...prev,
      gallery_videos: prev.gallery_videos.filter((_, i) => i !== index),
    }));
  };

  const handleAddShowFeature = (feature: {
    title: string;
    description: string;
    img_url: string;
  }) => {
    setShow((prev) => ({
      ...prev,
      show_features_details: [...prev.show_features_details, feature],
    }));
  };

  const removeShowFeature = (index: number) => {
    setShow((prev) => ({
      ...prev,
      show_features_details: prev.show_features_details.filter((_, i) => i !== index),
    }));
  };

  const handleAddCastMember = (member: {
    title: string;
    description: string;
    img_url: string;
  }) => {
    setShow((prev) => ({
      ...prev,
      cast_members: [...prev.cast_members, member],
    }));
  };

  const removeCastMember = (index: number) => {
    setShow((prev) => ({
      ...prev,
      cast_members: prev.cast_members.filter((_, i) => i !== index),
    }));
  };

  const handleAddVenueDetail = (detail: {
    title: string;
    description: string;
    link_url: string;
    img_url: string;
  }) => {
    setShow((prev) => ({
      ...prev,
      venue_details_array: [...prev.venue_details_array, detail],
    }));
  };

  const removeVenueDetail = (index: number) => {
    setShow((prev) => ({
      ...prev,
      venue_details_array: prev.venue_details_array.filter((_, i) => i !== index),
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
        {/* Basic Information - Top Level Fields */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Show name, descriptions, and URLs (top-level fields)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Show Name / Title *</Label>
                <Input
                  id="name"
                  value={show.name}
                  onChange={(e) => setShow({ ...show, name: e.target.value })}
                  placeholder="Sir Elton - At the Piano: The Music of Elton John"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_id">Product ID</Label>
                <Input
                  id="product_id"
                  type="number"
                  value={show.product_id}
                  onChange={(e) => setShow({ ...show, product_id: e.target.value })}
                  placeholder="23573"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="short_description">Short Description</Label>
              <textarea
                id="short_description"
                value={show.short_description}
                onChange={(e) =>
                  setShow({ ...show, short_description: e.target.value })
                }
                placeholder="Sir Elton is the live Elton John Vegas tribute show starring Jeff Burkett!"
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
                placeholder="Sir Elton stars pianist and vocalist Jeff Burkett, performing Elton John's greatest hits live at the piano."
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
                  placeholder="shows/sir-elton/"
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
                  placeholder="sir-elton"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency_symbol">Currency Symbol</Label>
                <Input
                  id="currency_symbol"
                  value={show.currency_symbol}
                  onChange={(e) =>
                    setShow({ ...show, currency_symbol: e.target.value })
                  }
                  disabled={loading}
                  placeholder="&#36;"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="review_count">Review Count</Label>
                <Input
                  id="review_count"
                  type="number"
                  value={show.review_count}
                  onChange={(e) =>
                    setShow({ ...show, review_count: e.target.value })
                  }
                  placeholder="0"
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
                  placeholder="https://ticketkite.com/wp-content/uploads/2025/05/se_800x533.jpg"
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
                  placeholder="https://ticketkite.com/wp-content/uploads/2025/05/se_1924x500.jpg"
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
                  placeholder="https://ticketkite.com/wp-content/uploads/2025/05/se_326x444.jpg"
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
                  placeholder="99.95"
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
                  placeholder="44.95"
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
                  placeholder="8"
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
                  placeholder="65-70 Minutes"
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
                <Label htmlFor="venue_id">Venue *</Label>
                <select
                  id="venue_id"
                  value={show.venue_id || ""}
                  onChange={(e) => {
                    const selectedVenueId = e.target.value ? Number(e.target.value) : null;
                    const selectedVenue = venues.find(v => v.id === selectedVenueId);
                    setShow({
                      ...show,
                      venue_id: selectedVenueId,
                      venue_name: selectedVenue?.name || ""
                    });
                  }}
                  disabled={loading}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select venue...</option>
                  {venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name}
                    </option>
                  ))}
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
                  placeholder="Featured Shows"
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
                  onClick={() => setCategoryModalOpen(true)}
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
                  onClick={() => setTagModalOpen(true)}
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

        {/* Series & Integration */}
        <Card>
          <CardHeader>
            <CardTitle>Series & Integration</CardTitle>
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
                  placeholder="22793"
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
                  placeholder="SirEltonAP"
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
                  placeholder="fd6b61980fe34059914c6a53d91fd6cc"
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
                  placeholder="TICKETKITEVEGAS"
                  disabled={loading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* additional_info.show_features */}
        <Card>
          <CardHeader>
            <CardTitle>Show Features</CardTitle>
            <CardDescription>Feature details for the show (additional_info.show_features)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="show_features_title">Features Title</Label>
              <Input
                id="show_features_title"
                value={show.show_features_title}
                onChange={(e) =>
                  setShow({ ...show, show_features_title: e.target.value })
                }
                placeholder=""
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Feature Details</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFeatureModalOpen(true)}
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Feature
                </Button>
              </div>
              <div className="space-y-2">
                {show.show_features_details.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 border rounded-md"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="font-medium">{feature.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {feature.description}
                      </div>
                      {feature.img_url && (
                        <div className="text-xs text-muted-foreground">
                          Image: {feature.img_url}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeShowFeature(index)}
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

        {/* additional_info.story */}
        <Card>
          <CardHeader>
            <CardTitle>Story</CardTitle>
            <CardDescription>
              Full detailed story and content for the show (additional_info.story - supports HTML)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="story_title">Story Title</Label>
                <Input
                  id="story_title"
                  value={show.story_title}
                  onChange={(e) =>
                    setShow({ ...show, story_title: e.target.value })
                  }
                  placeholder="Sir Elton – At the Piano: The Music of Elton John"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="story_sub_title">Story Sub Title</Label>
                <Input
                  id="story_sub_title"
                  value={show.story_sub_title}
                  onChange={(e) =>
                    setShow({ ...show, story_sub_title: e.target.value })
                  }
                  placeholder=""
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="story_description">Story Description</Label>
              <textarea
                id="story_description"
                value={show.story_description}
                onChange={(e) =>
                  setShow({ ...show, story_description: e.target.value })
                }
                placeholder="Sir Elton is a powerful and personal live tribute to the legendary music of Elton John..."
                disabled={loading}
                rows={12}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="story_enable_description">Enable Description</Label>
              <select
                id="story_enable_description"
                value={show.story_enable_description}
                onChange={(e) =>
                  setShow({ ...show, story_enable_description: e.target.value })
                }
                disabled={loading}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Cast Members */}
        <Card>
          <CardHeader>
            <CardTitle>Cast Members</CardTitle>
            <CardDescription>Add cast members for the show</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCastMemberModalOpen(true)}
              disabled={loading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Cast Member
            </Button>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {show.cast_members.map((member, index) => (
                <div key={index} className="relative group border rounded-md p-3">
                  <div className="space-y-1">
                    <div className="font-medium">{member.title}</div>
                    {member.description && (
                      <div className="text-sm text-muted-foreground">
                        {member.description}
                      </div>
                    )}
                    {member.img_url && (
                      <div className="relative h-24 w-full mt-2 overflow-hidden rounded-md border bg-muted">
                        <Image
                          src={member.img_url}
                          alt={member.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCastMember(index)}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gallery Images */}
        <Card>
          <CardHeader>
            <CardTitle>Gallery Media</CardTitle>
            <CardDescription>
              Add multiple images and videos for the show gallery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setGalleryImageModalOpen(true)}
                disabled={loading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Image URL
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setGalleryVideoModalOpen(true)}
                disabled={loading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Video URL
              </Button>
            </div>
            {show.gallery_images.length > 0 && (
              <div>
                <Label className="mb-2 block">Images</Label>
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
              </div>
            )}
            {show.gallery_videos.length > 0 && (
              <div>
                <Label className="mb-2 block">Videos</Label>
                <div className="space-y-2">
                  {show.gallery_videos.map((url, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                      <span className="flex-1 text-sm truncate">{url}</span>
                      <button
                        type="button"
                        onClick={() => removeGalleryVideo(index)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* additional_info.venue */}
        <Card>
          <CardHeader>
            <CardTitle>Venue</CardTitle>
            <CardDescription>Complete venue details (additional_info.venue)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="venue_title">Venue Title</Label>
                <Input
                  id="venue_title"
                  value={show.venue_title}
                  onChange={(e) =>
                    setShow({ ...show, venue_title: e.target.value })
                  }
                  placeholder="Modern Showrooms at Alexis Park Resort"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="venue_sub_title">Venue Sub Title</Label>
                <Input
                  id="venue_sub_title"
                  value={show.venue_sub_title}
                  onChange={(e) =>
                    setShow({ ...show, venue_sub_title: e.target.value })
                  }
                  placeholder="375 E. Harmon Ave, Las Vegas, NV 89069"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue_description">Venue Description</Label>
              <textarea
                id="venue_description"
                value={show.venue_description}
                onChange={(e) =>
                  setShow({ ...show, venue_description: e.target.value })
                }
                placeholder="Just off the busy Strip, the distinctive non-gaming, all-suite hotel known as Alexis Park Resort Hotel..."
                disabled={loading}
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="venue_img_url">Venue Image URL</Label>
                <Input
                  id="venue_img_url"
                  value={show.venue_img_url}
                  onChange={(e) =>
                    setShow({ ...show, venue_img_url: e.target.value })
                  }
                  placeholder="https://ticketkite.com/wp-content/uploads/2023/12/3.jpg"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="venue_link">Venue Link</Label>
                <Input
                  id="venue_link"
                  value={show.venue_link}
                  onChange={(e) =>
                    setShow({ ...show, venue_link: e.target.value })
                  }
                  placeholder="https://ticketkite.com/all-venues/modern-showrooms-alexis-park-resort/"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue_google_map">Google Map Embed HTML</Label>
              <textarea
                id="venue_google_map"
                value={show.venue_google_map}
                onChange={(e) =>
                  setShow({ ...show, venue_google_map: e.target.value })
                }
                placeholder="&lt;div style=&quot;width: 100%&quot;&gt;&lt;iframe width=&quot;100%&quot; height=&quot;600&quot;...&lt;/div&gt;"
                disabled={loading}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue_seat_map">Seat Map</Label>
              <Input
                id="venue_seat_map"
                value={show.venue_seat_map}
                onChange={(e) =>
                  setShow({ ...show, venue_seat_map: e.target.value })
                }
                placeholder=""
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue_enable_venue">Enable Venue</Label>
              <select
                id="venue_enable_venue"
                value={show.venue_enable_venue}
                onChange={(e) =>
                  setShow({ ...show, venue_enable_venue: e.target.value })
                }
                disabled={loading}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Venue Details</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setVenueDetailModalOpen(true)}
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Detail
                </Button>
              </div>
              <div className="space-y-2">
                {show.venue_details_array.map((detail, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 border rounded-md"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="font-medium">{detail.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {detail.description}
                      </div>
                      {detail.link_url && (
                        <div className="text-xs text-muted-foreground">
                          Link: {detail.link_url}
                        </div>
                      )}
                      {detail.img_url && (
                        <div className="relative h-16 w-16 mt-2 overflow-hidden rounded-md border bg-muted">
                          <Image
                            src={detail.img_url}
                            alt={detail.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVenueDetail(index)}
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

        {/* additional_info.yoast */}
        <Card>
          <CardHeader>
            <CardTitle>Yoast SEO</CardTitle>
            <CardDescription>
              Search engine optimization settings (additional_info.yoast)
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
                placeholder="Elton John Vegas"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yoast_focuskeywords">Focus Keywords</Label>
              <Input
                id="yoast_focuskeywords"
                value={show.yoast_focuskeywords}
                onChange={(e) =>
                  setShow({ ...show, yoast_focuskeywords: e.target.value })
                }
                placeholder="Elton John, Jeff Burkett, Sir Elton"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Multiple keywords separated by commas
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="yoast_metadesc">Meta Description</Label>
              <textarea
                id="yoast_metadesc"
                value={show.yoast_metadesc}
                onChange={(e) =>
                  setShow({ ...show, yoast_metadesc: e.target.value })
                }
                placeholder="Experience Sir Elton, a top-rated Elton John tribute show in Las Vegas, starring Jeff Burkett live at the piano..."
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
                placeholder="title"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Use title to insert the show title
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

      {/* Modals */}
      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSave={handleAddCategory}
      />
      <TagModal
        isOpen={tagModalOpen}
        onClose={() => setTagModalOpen(false)}
        onSave={handleAddTag}
      />
      <ShowFeatureModal
        isOpen={showFeatureModalOpen}
        onClose={() => setShowFeatureModalOpen(false)}
        onSave={handleAddShowFeature}
      />
      <CastMemberModal
        isOpen={castMemberModalOpen}
        onClose={() => setCastMemberModalOpen(false)}
        onSave={handleAddCastMember}
      />
      <VenueDetailModal
        isOpen={venueDetailModalOpen}
        onClose={() => setVenueDetailModalOpen(false)}
        onSave={handleAddVenueDetail}
      />
      <GalleryMediaModal
        isOpen={galleryImageModalOpen}
        onClose={() => setGalleryImageModalOpen(false)}
        onSave={handleAddGalleryMedia}
        type="image"
      />
      <GalleryMediaModal
        isOpen={galleryVideoModalOpen}
        onClose={() => setGalleryVideoModalOpen(false)}
        onSave={handleAddGalleryMedia}
        type="video"
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
