"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2, Plus, X, ImageIcon, Check } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { CastMemberModal } from "./_components/CastMemberModal";
import { VenueDetailModal } from "./_components/VenueDetailModal";
import { GalleryMediaModal } from "./_components/GalleryMediaModal";
import { ImageSelectModal } from "./_components/ImageSelectModal";
import { toast } from "@/lib/toast";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export default function EditShowPage() {
	const router = useRouter();
	const params = useParams();
	const id = params?.id as string;
	const isNew = id === "new";
	const [loading, setLoading] = useState(false);
	const [imageModalOpen, setImageModalOpen] = useState<
		"image_url" | "cover_image" | "portrait_image" | null
	>(null);
	const [venues, setVenues] = useState<Array<{ id: number; name: string }>>([]);

	// Available options from database
	const [availableCategories, setAvailableCategories] = useState<
		Array<{ id: number; term_id: number | null; name: string }>
	>([]);
	const [availableTags, setAvailableTags] = useState<
		Array<{ id: number; term_id: number | null; name: string }>
	>([]);
	const [availablePromotions, setAvailablePromotions] = useState<
		Array<{ id: number; promotion_id: number | null; name: string; code: string }>
	>([]);
	const [availablePriceLevels, setAvailablePriceLevels] = useState<
		Array<{ id: number; price_level_id: number | null; name: string; label: string | null }>
	>([]);
	const [availableShowFeatures, setAvailableShowFeatures] = useState<
		Array<{ id: number; title: string; description: string | null; img_url: string | null }>
	>([]);
	const [availableSeriesCodes, setAvailableSeriesCodes] = useState<
		Array<{ id: number; name: string }>
	>([]);

	// Keys to reset Select components after selection
	const [categorySelectKey, setCategorySelectKey] = useState(0);
	const [tagSelectKey, setTagSelectKey] = useState(0);
	const [promotionSelectKey, setPromotionSelectKey] = useState(0);
	const [priceLevelSelectKey, setPriceLevelSelectKey] = useState(0);
	const [showFeatureSelectKey, setShowFeatureSelectKey] = useState(0);

	// Modal states
	const [castMemberModalOpen, setCastMemberModalOpen] = useState(false);
	const [venueDetailModalOpen, setVenueDetailModalOpen] = useState(false);
	const [galleryImageModalOpen, setGalleryImageModalOpen] = useState(false);
	const [galleryVideoModalOpen, setGalleryVideoModalOpen] = useState(false);

	const [show, setShow] = useState({
		// Basic Info
		name: "",
		description: "",
		short_description: "",
		product_url: "",
		product_slug: "",
		product_id: "",
		currency_symbol: "",

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
		status: "",

		// Duration
		duration: "",

		// Story content
		story_description: "",
		story_title: "",
		story_sub_title: "",
		story_enable_description: "",

		// Additional fields
		series_id: "",
		series_code: "",
		nliven_token: "",
		nliven_promo_code: "",

		// JSON fields
		categories: [] as Array<{ id?: number; term_id: number; name: string }>,
		tags: [] as Array<{ id?: number; term_id: number; name: string }>,
		promotions: [] as Array<{ id?: number; promotion_id: number; name: string; code: string }>,
		priceLevels: [] as Array<{
			id?: number;
			price_level_id: number;
			name: string;
			label: string | null;
		}>,
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
		venue_enable_venue: "",
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
			id: number;
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
				.select(
					"id, venue_id, status, product_slug, product_id, series_id, title, series_code, data"
				)
				.eq("id", id)
				.maybeSingle();

			if (error) {
				console.error("Error loading show:", error);
				toast.error("Failed to load show from database: " + error.message);
				setLoading(false);
				return;
			}

			if (!data) {
				setLoading(false);
				return;
			}

			// Extract data from JSONB field or fallback to root level (for backward compatibility)
			const showData =
				(data.data as Record<string, unknown> | null) ||
				(data as unknown as Record<string, unknown>);

			// Use column values if available, otherwise fallback to JSONB data
			const titleValue =
				(data.title as string | undefined) ||
				(showData.title as string | undefined) ||
				(showData.name as string | undefined) ||
				"";
			const productSlugValue =
				(data.product_slug as string | undefined) ||
				(showData.product_slug as string | undefined) ||
				"";
			const productIdValue =
				(data.product_id as number | undefined) || (showData.product_id as number | undefined);
			const seriesIdValue =
				(data.series_id as string | undefined) || (showData.series_id as string | undefined) || "";
			const seriesCodeValue =
				(data.series_code as string | undefined) ||
				(showData.series_code as string | undefined) ||
				"";

			// Extract additional_info if it exists
			const additionalInfo =
				(showData.additional_info as {
					show_features?: unknown;
					story?: unknown;
					venue?: unknown;
					yoast?: unknown;
				} | null) || {};

			const showFeatures = showData.show_features || additionalInfo.show_features || null;
			const storyData = showData.story || additionalInfo.story || null;
			const venueData = showData.venue_details || additionalInfo.venue || null;
			const yoastData = showData.yoast_seo || additionalInfo.yoast || null;

			// Load venue data from venues table if venue_id is set
			let venueTitle = (venueData as { title?: string } | null)?.title ?? "";
			let venueSubTitle = (venueData as { sub_title?: string } | null)?.sub_title ?? "";
			let venueDescription = (venueData as { description?: string } | null)?.description ?? "";
			let venueImgUrl = (venueData as { img_url?: string } | null)?.img_url ?? "";
			let venueLink = (venueData as { venue_link?: string } | null)?.venue_link ?? "";
			const venueId = (data.venue_id as number | null) || null;

			if (venueId) {
				try {
					const { data: venueTableData, error: venueError } = await supabase
						.from("venues")
						.select("*")
						.eq("id", venueId)
						.maybeSingle();

					if (!venueError && venueTableData) {
						// Format address for sub_title
						const addressParts = [
							venueTableData.address1,
							venueTableData.city,
							venueTableData.state,
							venueTableData.postal_code,
						].filter(Boolean);
						venueSubTitle = addressParts.join(", ");

						// Format venue_link (use venue_url, format as full URL if needed)
						venueLink = venueTableData.venue_url
							? venueTableData.venue_url.startsWith("http")
								? venueTableData.venue_url
								: `https://ticketkite.com/all-venues/${venueTableData.venue_url}/`
							: "";

						venueTitle = venueTableData.name || "";
						venueDescription = venueTableData.description || "";
						venueImgUrl = venueTableData.img_src || "";
					}
				} catch (error) {
					console.error("Error loading venue data:", error);
					// Continue with data from JSONB if venue fetch fails
				}
			}

			setShow({
				name: titleValue,
				description: (showData.description ?? "") as string,
				short_description: (showData.short_description ?? "") as string,
				product_url: productSlugValue ? `/shows/${productSlugValue}` : "",
				product_slug: productSlugValue,
				product_id: productIdValue ? String(productIdValue) : "",
				currency_symbol: (showData.currency_symbol as string | undefined) ?? "",
				price: (showData.regular_price as string | number | undefined)
					? String(showData.regular_price)
					: (showData.price as number | undefined)
						? String(showData.price)
						: "",
				discountedPrice: (showData.sale_price as string | number | undefined)
					? String(showData.sale_price)
					: (showData.discounted_price as number | undefined)
						? String(showData.discounted_price)
						: "",
				percentage_fee: (showData.percentage_fee ?? "") as string,
				image_url: (showData.img_src ?? showData.image_url ?? "") as string,
				cover_image: (showData.cover_image ?? "") as string,
				portrait_image: (showData.portrait_image ?? "") as string,
				venue_id: (data.venue_id as number | null) || null,
				venue_name: (showData.venue_name ?? "") as string,
				category: (showData.category ?? "") as string,
				status: (data.status ?? "") as string,
				duration: (showData.duration_minutes ?? "") as string,
				story_description: (storyData as { description?: string } | null)?.description ?? "",
				story_title: (storyData as { title?: string } | null)?.title ?? "",
				story_sub_title: (storyData as { sub_title?: string } | null)?.sub_title ?? "",
				story_enable_description:
					(storyData as { enable_description?: string } | null)?.enable_description ?? "",
				series_id: seriesIdValue,
				series_code: seriesCodeValue,
				nliven_token: (showData.nliven_token ?? "") as string,
				nliven_promo_code: (showData.nliven_promo_code ?? "") as string,
				categories: Array.isArray(showData.categories)
					? (showData.categories as Array<{ term_id: number; name: string }>)
					: [],
				tags: Array.isArray(showData.tags)
					? (showData.tags as Array<{ term_id: number; name: string }>)
					: [],
				promotions:
					(
						additionalInfo.venue as {
							venue_series_data?: {
								promotions?: Array<{ id: number; name: string; code: string }>;
							};
						} | null
					)?.venue_series_data?.promotions?.map((p) => ({
						promotion_id: p.id,
						name: p.name,
						code: p.code,
					})) || [],
				priceLevels:
					(
						additionalInfo.venue as {
							venue_series_data?: {
								priceLevels?: Array<{ id: number; name: string; label?: string | null }>;
							};
						} | null
					)?.venue_series_data?.priceLevels?.map((pl) => ({
						price_level_id: pl.id,
						name: pl.name,
						label: pl.label || null,
					})) || [],
				show_features: showFeatures as Record<string, unknown> | null,
				story: storyData as Record<string, unknown> | null,
				venue_details: venueData as Record<string, unknown> | null,
				additional_info: (showData.additional_info as Record<string, unknown>) || null,
				cast_members: Array.isArray(showData.cast_members)
					? (
							showData.cast_members as Array<{
								title?: string;
								description?: string;
								img_url?: string;
							}>
						).map((item) => ({
							title: item.title || "",
							description: item.description || "",
							img_url: item.img_url || "",
						}))
					: (
							storyData as {
								cast?: {
									details?: Array<{ title?: string; description?: string; img_url?: string }>;
								};
							} | null
						)?.cast?.details?.map((item) => ({
							title: item.title || "",
							description: item.description || "",
							img_url: item.img_url || "",
						})) || [],
				gallery_images:
					Array.isArray(showData.gallery_images) && showData.gallery_images.length > 0
						? (showData.gallery_images as string[])
						: (((storyData as { media?: { details?: { images?: string[] } } } | null)?.media
								?.details?.images || []) as string[]),
				gallery_videos: ((storyData as { media?: { details?: { videos?: string[] } } } | null)
					?.media?.details?.videos || []) as string[],

				// Venue fields - loaded from venues table
				venue_title: venueTitle,
				venue_sub_title: venueSubTitle,
				venue_description: venueDescription,
				venue_enable_venue: (venueData as { enable_venue?: string } | null)?.enable_venue ?? "",
				venue_img_url: venueImgUrl,
				venue_link: venueLink,
				venue_google_map: (venueData as { google_map?: string } | null)?.google_map ?? "",
				venue_seat_map: (venueData as { seat_map?: string } | null)?.seat_map ?? "",
				venue_series_data: (venueData as { venue_series_data?: unknown } | null)?.venue_series_data
					? ((venueData as { venue_series_data: Record<string, unknown> })
							.venue_series_data as Record<string, unknown>)
					: null,
				venue_details_array: Array.isArray((venueData as { details?: unknown[] } | null)?.details)
					? (
							venueData as {
								details: Array<{
									title?: string;
									description?: string;
									link_url?: string;
									img_url?: string;
								}>;
							}
						).details.map((item) => ({
							title: item.title || "",
							description: item.description || "",
							link_url: item.link_url || "",
							img_url: item.img_url || "",
						}))
					: [],

				// Show Features
				show_features_title: (showFeatures as { title?: string } | null)?.title ?? "",
				show_features_details: Array.isArray(
					(showFeatures as { details?: unknown[] } | null)?.details
				)
					? (
							showFeatures as {
								details: Array<{ title?: string; description?: string; img_url?: string }>;
							}
						).details.map((item) => ({
							id: 0, // Legacy data doesn't have id, set to 0
							title: item.title || "",
							description: item.description || "",
							img_url: item.img_url || "",
						}))
					: [],

				// Yoast SEO fields
				yoast_focuskw:
					(yoastData as { yoast_wpseo_focuskw?: string } | null)?.yoast_wpseo_focuskw ?? "",
				yoast_focuskeywords:
					(yoastData as { yoast_wpseo_focuskeywords?: string } | null)?.yoast_wpseo_focuskeywords ??
					"",
				yoast_metadesc:
					(yoastData as { yoast_wpseo_metadesc?: string } | null)?.yoast_wpseo_metadesc ?? "",
				yoast_title: (yoastData as { yoast_wpseo_title?: string } | null)?.yoast_wpseo_title ?? "",
				yoast_seo: yoastData as Record<string, unknown> | null,
			});
		} catch (error) {
			console.error("Unexpected error:", error);
			toast.error("Failed to load show");
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

				setVenues((data || []).map((v) => ({ id: v.id, name: v.name || "" })));
			} catch (error) {
				console.error("Error loading venues:", error);
			}
		};

		void loadVenues();
	}, []);

	// Load categories for dropdown
	useEffect(() => {
		const loadCategories = async () => {
			try {
				const { data, error } = await supabase
					.from("categories")
					.select("id, term_id, name, status")
					.or("status.eq.active,status.is.null")
					.order("name", { ascending: true });

				if (error) {
					console.error("Error loading categories:", error);
					return;
				}

				setAvailableCategories(data || []);
			} catch (error) {
				console.error("Error loading categories:", error);
			}
		};

		void loadCategories();
	}, []);

	// Load tags for dropdown
	useEffect(() => {
		const loadTags = async () => {
			try {
				const { data, error } = await supabase
					.from("tags")
					.select("id, term_id, name, status")
					.or("status.eq.active,status.is.null")
					.order("name", { ascending: true });

				if (error) {
					console.error("Error loading tags:", error);
					return;
				}

				setAvailableTags(data || []);
			} catch (error) {
				console.error("Error loading tags:", error);
			}
		};

		void loadTags();
	}, []);

	// Load promotions for dropdown
	useEffect(() => {
		const loadPromotions = async () => {
			try {
				const { data, error } = await supabase
					.from("promotions")
					.select("id, promotion_id, name, code, status")
					.or("status.eq.active,status.is.null")
					.order("name", { ascending: true });

				if (error) {
					console.error("Error loading promotions:", error);
					return;
				}

				setAvailablePromotions(data || []);
			} catch (error) {
				console.error("Error loading promotions:", error);
			}
		};

		void loadPromotions();
	}, []);

	// Load price levels for dropdown
	useEffect(() => {
		const loadPriceLevels = async () => {
			try {
				const { data, error } = await supabase
					.from("price_levels")
					.select("id, price_level_id, name, label, status")
					.or("status.eq.active,status.is.null")
					.order("name", { ascending: true });

				if (error) {
					console.error("Error loading price levels:", error);
					return;
				}

				setAvailablePriceLevels(data || []);
			} catch (error) {
				console.error("Error loading price levels:", error);
			}
		};

		void loadPriceLevels();
	}, []);

	// Load show features for dropdown
	useEffect(() => {
		const loadShowFeatures = async () => {
			try {
				const { data, error } = await supabase
					.from("show_features")
					.select("id, title, description, img_url, status")
					.or("status.eq.active,status.is.null")
					.order("title", { ascending: true });

				if (error) {
					console.error("Error loading show features:", error);
					return;
				}

				setAvailableShowFeatures(data || []);
			} catch (error) {
				console.error("Error loading show features:", error);
			}
		};

		void loadShowFeatures();
	}, []);

	// Load series codes for dropdown
	useEffect(() => {
		const loadSeriesCodes = async () => {
			try {
				const { data, error } = await supabase
					.from("series_codes")
					.select("id, name, status")
					.or("status.eq.active,status.is.null")
					.order("name", { ascending: true });

				if (error) {
					console.error("Error loading series codes:", error);
					return;
				}

				setAvailableSeriesCodes(data || []);
			} catch (error) {
				console.error("Error loading series codes:", error);
			}
		};

		void loadSeriesCodes();
	}, []);

	useEffect(() => {
		if (!isNew) {
			void loadShow();
		}
	}, [isNew, loadShow]);

	const handleImageSelect = (imageUrl: string) => {
		if (imageModalOpen) {
			setShow((prev) => ({
				...prev,
				[imageModalOpen]: imageUrl,
			}));
			setImageModalOpen(null);
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
				details: show.show_features_details.map((f) => ({
					title: f.title,
					description: f.description,
					img_url: f.img_url,
				})),
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
				enable_description: show.story_enable_description || null,
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

			// Build venue object with promotions in venue_series_data
			const venueSeriesData = show.venue_series_data as {
				id?: number;
				name?: string;
				venue?: unknown;
				seriesCode?: string;
				publicUrl?: string;
				isGASales?: boolean;
				priceLevels?: unknown[];
				priceTypes?: unknown[];
				promotions?: Array<{
					id: number;
					name: string;
					code: string;
					requireEvenNumberOfTickets?: boolean;
				}>;
				seatAlerts?: unknown[];
			} | null;

			// Convert show.promotions to venue_series_data.promotions format
			const mergedPromotions = show.promotions.map((p) => ({
				id: p.promotion_id,
				name: p.name,
				code: p.code,
				requireEvenNumberOfTickets: false,
			}));

			// Convert show.priceLevels to venue_series_data.priceLevels format
			const priceLevelsData = show.priceLevels.map((pl) => ({
				id: pl.price_level_id,
				name: pl.name,
				label: pl.label || "",
			}));

			const venueObj = {
				title: show.venue_title || "",
				sub_title: show.venue_sub_title || "",
				description: show.venue_description || "",
				enable_venue: show.venue_enable_venue || null,
				img_url: show.venue_img_url || "",
				venue_link: show.venue_link || "",
				length: String(show.venue_details_array.length),
				venue_series_data: venueSeriesData
					? {
							...venueSeriesData,
							promotions:
								mergedPromotions.length > 0 ? mergedPromotions : venueSeriesData.promotions || [],
							priceLevels:
								priceLevelsData.length > 0 ? priceLevelsData : venueSeriesData.priceLevels || [],
						}
					: mergedPromotions.length > 0 || priceLevelsData.length > 0
						? {
								promotions: mergedPromotions.length > 0 ? mergedPromotions : undefined,
								priceLevels: priceLevelsData.length > 0 ? priceLevelsData : undefined,
							}
						: null,
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
				product_url: show.product_slug ? `/shows/${show.product_slug}` : null,
				product_slug: show.product_slug || null,
				description: show.description || null,
				short_description: show.short_description || null,
				currency_symbol: show.currency_symbol || null,
				regular_price: show.price || null,
				sale_price: show.discountedPrice || null,
				img_src: show.image_url || null,
				cover_image: show.cover_image || null,
				portrait_image: show.portrait_image || null,
				series_code: show.series_code || null,
				categories: show.categories.map((c) => ({ term_id: c.term_id, name: c.name })),
				tags: show.tags.map((t) => ({ term_id: t.term_id, name: t.name })),
				review_count: 0, // Auto-incremented when reviews are added
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
				toast.error(
					`A show with the same ${duplicateFields.join(", ")} already exists (Show ID: ${duplicateFound.id}). Please use different values.`
				);
				setLoading(false);
				return;
			}

			// Build the final payload - minimal columns for filtering + data JSONB
			// Schema: id, venue_id, status, product_slug, product_id, series_id, title, series_code, data (JSONB)
			const payload: Record<string, unknown> = {
				venue_id: show.venue_id || null,
				status: show.status || null,
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
				toast.error("Error saving show: " + error.message);
			} else {
				toast.success(isNew ? "Show created successfully!" : "Show updated successfully!");
				setTimeout(() => {
					router.push("/dashboard/shows");
				}, 1500);
			}
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "Unknown error occurred";
			toast.error("Error saving show: " + message);
		} finally {
			setLoading(false);
		}
	};

	const handleAddCategory = (categoryId: string) => {
		const category = availableCategories.find((c) => c.id.toString() === categoryId);
		if (!category) return;

		// Check if already added
		if (show.categories.some((c) => c.term_id === category.term_id)) {
			toast.error("Category already added");
			return;
		}

		setShow((prev) => ({
			...prev,
			categories: [
				...prev.categories,
				{ id: category.id, term_id: category.term_id || Date.now(), name: category.name },
			],
		}));
	};

	const removeCategory = (index: number) => {
		setShow((prev) => ({
			...prev,
			categories: prev.categories.filter((_, i) => i !== index),
		}));
	};

	const handleAddTag = (tagId: string) => {
		const tag = availableTags.find((t) => t.id.toString() === tagId);
		if (!tag) return;

		// Check if already added
		if (show.tags.some((t) => t.term_id === tag.term_id)) {
			toast.error("Tag already added");
			return;
		}

		setShow((prev) => ({
			...prev,
			tags: [...prev.tags, { id: tag.id, term_id: tag.term_id || Date.now(), name: tag.name }],
		}));
	};

	const removeTag = (index: number) => {
		setShow((prev) => ({
			...prev,
			tags: prev.tags.filter((_, i) => i !== index),
		}));
	};

	const handleAddPromotion = (promotionId: string) => {
		const promotion = availablePromotions.find((p) => p.id.toString() === promotionId);
		if (!promotion) return;

		// Check if already added
		if (show.promotions.some((p) => p.promotion_id === promotion.promotion_id)) {
			toast.error("Promotion already added");
			return;
		}

		setShow((prev) => ({
			...prev,
			promotions: [
				...prev.promotions,
				{
					id: promotion.id,
					promotion_id: promotion.promotion_id || Date.now(),
					name: promotion.name,
					code: promotion.code,
				},
			],
		}));
	};

	const removePromotion = (index: number) => {
		setShow((prev) => ({
			...prev,
			promotions: prev.promotions.filter((_, i) => i !== index),
		}));
	};

	const handleAddPriceLevel = (priceLevelId: string) => {
		const priceLevel = availablePriceLevels.find((pl) => pl.id.toString() === priceLevelId);
		if (!priceLevel) return;

		// Check if already added
		if (show.priceLevels.some((pl) => pl.price_level_id === priceLevel.price_level_id)) {
			toast.error("Price level already added");
			return;
		}

		setShow((prev) => ({
			...prev,
			priceLevels: [
				...prev.priceLevels,
				{
					id: priceLevel.id,
					price_level_id: priceLevel.price_level_id || Date.now(),
					name: priceLevel.name,
					label: priceLevel.label,
				},
			],
		}));
	};

	const removePriceLevel = (index: number) => {
		setShow((prev) => ({
			...prev,
			priceLevels: prev.priceLevels.filter((_, i) => i !== index),
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

	const handleAddGalleryMediaMultiple = (urls: string[], type: "image" | "video") => {
		if (type === "image") {
			setShow((prev) => ({
				...prev,
				gallery_images: [...prev.gallery_images, ...urls],
			}));
		} else {
			setShow((prev) => ({
				...prev,
				gallery_videos: [...prev.gallery_videos, ...urls],
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

	const handleAddShowFeature = (featureId: string) => {
		const feature = availableShowFeatures.find((f) => f.id.toString() === featureId);
		if (!feature) return;

		// Check if already added
		if (show.show_features_details.some((f) => f.id === feature.id)) {
			toast.error("Show feature already added");
			return;
		}

		setShow((prev) => ({
			...prev,
			show_features_details: [
				...prev.show_features_details,
				{
					id: feature.id,
					title: feature.title,
					description: feature.description || "",
					img_url: feature.img_url || "",
				},
			],
		}));
		setShowFeatureSelectKey((prev) => prev + 1);
	};

	const removeShowFeature = (index: number) => {
		setShow((prev) => ({
			...prev,
			show_features_details: prev.show_features_details.filter((_, i) => i !== index),
		}));
	};

	const handleAddCastMember = (member: { title: string; description: string; img_url: string }) => {
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
						{id === "new" ? "Add a new show to your listings" : "Update show information"}
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
								onChange={(e) => setShow({ ...show, short_description: e.target.value })}
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
								onChange={(e) => setShow({ ...show, description: e.target.value })}
								placeholder="Sir Elton stars pianist and vocalist Jeff Burkett, performing Elton John's greatest hits live at the piano."
								disabled={loading}
								rows={6}
								className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="product_slug">Product Slug</Label>
								<Input
									id="product_slug"
									value={show.product_slug}
									onChange={(e) => {
										const slug = e.target.value;
										setShow({
											...show,
											product_slug: slug,
											product_url: slug ? `/shows/${slug}` : "",
										});
									}}
									placeholder="sir-elton"
									disabled={loading}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="product_url">Product URL</Label>
								<Input
									id="product_url"
									value={show.product_slug ? `/shows/${show.product_slug}` : ""}
									placeholder="/shows/sir-elton"
									disabled={true}
									className="bg-muted cursor-not-allowed"
								/>
								<p className="text-xs text-muted-foreground">
									Automatically generated from Product Slug
								</p>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="currency_symbol">Currency Symbol</Label>
								<Input
									id="currency_symbol"
									value={show.currency_symbol}
									onChange={(e) => setShow({ ...show, currency_symbol: e.target.value })}
									disabled={loading}
									placeholder="&#36;"
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
								<div className="flex items-center gap-4">
									{show.image_url && (
										<div className="relative h-20 w-32 overflow-hidden rounded-md border bg-muted">
											<Image
												src={show.image_url}
												alt="Main image"
												fill
												className="object-cover"
												unoptimized
											/>
										</div>
									)}
									<Button
										type="button"
										variant="outline"
										onClick={() => setImageModalOpen("image_url")}
										disabled={loading}
									>
										<ImageIcon className="mr-2 h-4 w-4" />
										{show.image_url ? "Change Image" : "Select Image"}
									</Button>
								</div>
								<Input
									value={show.image_url}
									onChange={(e) => setShow({ ...show, image_url: e.target.value })}
									placeholder="https://ticketkite.com/wp-content/uploads/2025/05/se_800x533.jpg"
									className="mt-2"
								/>
								<p className="text-xs text-muted-foreground">
									Click &quot;Select Image&quot; to browse S3 bucket images or upload a new one
								</p>
							</div>

							{/* Cover Image */}
							<div className="space-y-2">
								<Label htmlFor="cover_image">Cover Image (1924x500)</Label>
								<div className="flex items-center gap-4">
									{show.cover_image && (
										<div className="relative h-20 w-32 overflow-hidden rounded-md border bg-muted">
											<Image
												src={show.cover_image}
												alt="Cover image"
												fill
												className="object-cover"
												unoptimized
											/>
										</div>
									)}
									<Button
										type="button"
										variant="outline"
										onClick={() => setImageModalOpen("cover_image")}
										disabled={loading}
									>
										<ImageIcon className="mr-2 h-4 w-4" />
										{show.cover_image ? "Change Image" : "Select Image"}
									</Button>
								</div>
								<Input
									value={show.cover_image}
									onChange={(e) => setShow({ ...show, cover_image: e.target.value })}
									placeholder="https://ticketkite.com/wp-content/uploads/2025/05/se_1924x500.jpg"
									className="mt-2"
								/>
								<p className="text-xs text-muted-foreground">
									Click &quot;Select Image&quot; to browse S3 bucket images or upload a new one
								</p>
							</div>

							{/* Portrait Image */}
							<div className="space-y-2">
								<Label htmlFor="portrait_image">Portrait Image (326x444)</Label>
								<div className="flex items-center gap-4">
									{show.portrait_image && (
										<div className="relative h-20 w-32 overflow-hidden rounded-md border bg-muted">
											<Image
												src={show.portrait_image}
												alt="Portrait image"
												fill
												className="object-cover"
												unoptimized
											/>
										</div>
									)}
									<Button
										type="button"
										variant="outline"
										onClick={() => setImageModalOpen("portrait_image")}
										disabled={loading}
									>
										<ImageIcon className="mr-2 h-4 w-4" />
										{show.portrait_image ? "Change Image" : "Select Image"}
									</Button>
								</div>
								<Input
									value={show.portrait_image}
									onChange={(e) => setShow({ ...show, portrait_image: e.target.value })}
									placeholder="https://ticketkite.com/wp-content/uploads/2025/05/se_326x444.jpg"
									className="mt-2"
								/>
								<p className="text-xs text-muted-foreground">
									Click &quot;Select Image&quot; to browse S3 bucket images or upload a new one
								</p>
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
									onChange={(e) => setShow({ ...show, discountedPrice: e.target.value })}
									placeholder="44.95"
									disabled={loading}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="percentage_fee">Percentage Fee (%)</Label>
								<Input
									id="percentage_fee"
									value={show.percentage_fee}
									onChange={(e) => setShow({ ...show, percentage_fee: e.target.value })}
									placeholder="8"
									disabled={loading}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="duration">Duration</Label>
								<Input
									id="duration"
									value={show.duration}
									onChange={(e) => setShow({ ...show, duration: e.target.value })}
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
								<Label htmlFor="venue_id">
									Venue <span className="text-destructive">*</span>
								</Label>
								<Select
									value={show.venue_id?.toString() || ""}
									onValueChange={async (value) => {
										const selectedVenueId = value ? Number(value) : null;
										const selectedVenue = venues.find((v) => v.id === selectedVenueId);

										// Load full venue data if a venue is selected
										if (selectedVenueId) {
											try {
												const { data: venueData, error } = await supabase
													.from("venues")
													.select("*")
													.eq("id", selectedVenueId)
													.maybeSingle();

												if (error) {
													console.error("Error loading venue:", error);
													toast.error("Failed to load venue data");
												} else if (venueData) {
													// Format address for sub_title
													const addressParts = [
														venueData.address1,
														venueData.city,
														venueData.state,
														venueData.postal_code,
													].filter(Boolean);
													const formattedAddress = addressParts.join(", ");

													// Format venue_link (use venue_url, format as full URL if needed)
													const venueLink = venueData.venue_url
														? venueData.venue_url.startsWith("http")
															? venueData.venue_url
															: `https://ticketkite.com/all-venues/${venueData.venue_url}/`
														: "";

													setShow({
														...show,
														venue_id: selectedVenueId,
														venue_name: venueData.name || "",
														venue_title: venueData.name || "",
														venue_sub_title: formattedAddress,
														venue_description: venueData.description || "",
														venue_img_url: venueData.img_src || "",
														venue_link: venueLink,
													});
													return;
												}
											} catch (error) {
												console.error("Error loading venue:", error);
												toast.error("Failed to load venue data");
											}
										}

										// If no venue selected or error, just set basic fields
										setShow({
											...show,
											venue_id: selectedVenueId,
											venue_name: selectedVenue?.name || "",
											venue_title: "",
											venue_sub_title: "",
											venue_description: "",
											venue_img_url: "",
											venue_link: "",
										});
									}}
									disabled={loading}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select venue..." />
									</SelectTrigger>
									<SelectContent>
										{venues.map((venue) => (
											<SelectItem key={venue.id} value={venue.id.toString()}>
												{venue.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="category">Primary Category</Label>
								<Input
									id="category"
									value={show.category}
									onChange={(e) => setShow({ ...show, category: e.target.value })}
									placeholder="Featured Shows"
									disabled={loading}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="status">Status</Label>
								<Select
									value={show.status}
									onValueChange={(value) => setShow({ ...show, status: value })}
									disabled={loading}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select status..." />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="active">Active</SelectItem>
										<SelectItem value="inactive">Inactive</SelectItem>
										<SelectItem value="draft">Draft</SelectItem>
									</SelectContent>
								</Select>
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
						<div className="space-y-2 w-full">
							<Label>Categories</Label>
							<Select
								key={categorySelectKey}
								onValueChange={(value: string) => {
									if (value) {
										handleAddCategory(value);
										// Reset select by changing key (force re-render)
										setCategorySelectKey((prev: number) => prev + 1);
									}
								}}
								disabled={loading}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select a category..." />
								</SelectTrigger>
								<SelectContent className="w-(--radix-select-trigger-width)">
									{availableCategories.map((category) => {
										const isSelected = show.categories.some((c) => c.term_id === category.term_id);
										return (
											<SelectItem
												key={category.id}
												value={category.id.toString()}
												disabled={isSelected}
												className={isSelected ? "opacity-60" : ""}
											>
												<div className="flex items-center gap-2 w-full">
													{isSelected && <Check className="h-4 w-4 shrink-0" />}
													<span>{category.name}</span>
												</div>
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
							<div className="flex flex-wrap gap-2 mt-2">
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

						<div className="space-y-2 w-full">
							<Label>Tags</Label>
							<Select
								key={tagSelectKey}
								onValueChange={(value: string) => {
									if (value) {
										handleAddTag(value);
										// Reset select by changing key (force re-render)
										setTagSelectKey((prev: number) => prev + 1);
									}
								}}
								disabled={loading}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select a tag..." />
								</SelectTrigger>
								<SelectContent className="w-(--radix-select-trigger-width)">
									{availableTags.map((tag) => {
										const isSelected = show.tags.some((t) => t.term_id === tag.term_id);
										return (
											<SelectItem
												key={tag.id}
												value={tag.id.toString()}
												disabled={isSelected}
												className={isSelected ? "opacity-60" : ""}
											>
												<div className="flex items-center gap-2 w-full">
													{isSelected && <Check className="h-4 w-4 shrink-0" />}
													<span>{tag.name}</span>
												</div>
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
							<div className="flex flex-wrap gap-2 mt-2">
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

						<div className="space-y-2 w-full">
							<Label>Promotions</Label>
							<Select
								key={promotionSelectKey}
								onValueChange={(value: string) => {
									if (value) {
										handleAddPromotion(value);
										// Reset select by changing key (force re-render)
										setPromotionSelectKey((prev: number) => prev + 1);
									}
								}}
								disabled={loading}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select a promotion..." />
								</SelectTrigger>
								<SelectContent className="w-(--radix-select-trigger-width)">
									{availablePromotions.map((promotion) => {
										const isSelected = show.promotions.some(
											(p) => p.promotion_id === promotion.promotion_id
										);
										return (
											<SelectItem
												key={promotion.id}
												value={promotion.id.toString()}
												disabled={isSelected}
												className={isSelected ? "opacity-60" : ""}
											>
												<div className="flex items-center gap-2 w-full">
													{isSelected && <Check className="h-4 w-4 shrink-0" />}
													<span>
														{promotion.name} ({promotion.code})
													</span>
												</div>
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
							<div className="flex flex-wrap gap-2 mt-2">
								{show.promotions.map((promo, index) => (
									<div
										key={index}
										className="flex items-center gap-2 bg-muted px-3 py-1 rounded-md text-sm"
									>
										<span>
											{promo.name} ({promo.code})
										</span>
										<button
											type="button"
											onClick={() => removePromotion(index)}
											className="text-destructive hover:text-destructive/80"
										>
											<X className="h-3 w-3" />
										</button>
									</div>
								))}
							</div>
						</div>

						<div className="space-y-2 w-full">
							<Label>Price Levels</Label>
							<Select
								key={priceLevelSelectKey}
								onValueChange={(value: string) => {
									if (value) {
										handleAddPriceLevel(value);
										// Reset select by changing key (force re-render)
										setPriceLevelSelectKey((prev: number) => prev + 1);
									}
								}}
								disabled={loading}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select a price level..." />
								</SelectTrigger>
								<SelectContent className="w-(--radix-select-trigger-width)">
									{availablePriceLevels.map((priceLevel) => {
										const isSelected = show.priceLevels.some(
											(pl) => pl.price_level_id === priceLevel.price_level_id
										);
										return (
											<SelectItem
												key={priceLevel.id}
												value={priceLevel.id.toString()}
												disabled={isSelected}
												className={isSelected ? "opacity-60" : ""}
											>
												<div className="flex items-center gap-2 w-full">
													{isSelected && <Check className="h-4 w-4 shrink-0" />}
													<span>
														{priceLevel.name} {priceLevel.label && `(${priceLevel.label})`}
													</span>
												</div>
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
							<div className="flex flex-wrap gap-2 mt-2">
								{show.priceLevels.map((pl, index) => (
									<div
										key={index}
										className="flex items-center gap-2 bg-muted px-3 py-1 rounded-md text-sm"
									>
										<span>
											{pl.name} {pl.label && `(${pl.label})`}
										</span>
										<button
											type="button"
											onClick={() => removePriceLevel(index)}
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
						<CardDescription>Series codes, tokens, and promo codes</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="series_id">Series ID</Label>
								<Input
									id="series_id"
									value={show.series_id}
									onChange={(e) => setShow({ ...show, series_id: e.target.value })}
									placeholder="22793"
									disabled={loading}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="series_code">Series Code</Label>
								<Select
									value={show.series_code}
									onValueChange={(value: string) => {
										setShow({ ...show, series_code: value });
									}}
									disabled={loading}
								>
									<SelectTrigger id="series_code" className="w-full">
										<SelectValue placeholder="Select series code..." />
									</SelectTrigger>
									<SelectContent>
										{availableSeriesCodes.map((seriesCode) => (
											<SelectItem key={seriesCode.id} value={seriesCode.name}>
												{seriesCode.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="nliven_token">NLiven Token</Label>
								<Input
									id="nliven_token"
									value={show.nliven_token}
									onChange={(e) => setShow({ ...show, nliven_token: e.target.value })}
									placeholder="fd6b61980fe34059914c6a53d91fd6cc"
									disabled={loading}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="nliven_promo_code">NLiven Promo Code</Label>
								<Select
									value={show.nliven_promo_code || "__none__"}
									onValueChange={(value: string) => {
										setShow({ ...show, nliven_promo_code: value === "__none__" ? "" : value });
									}}
									disabled={loading}
								>
									<SelectTrigger id="nliven_promo_code" className="w-full">
										<SelectValue placeholder="Select promo code..." />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="__none__">None</SelectItem>
										{availablePromotions.map((promotion) => (
											<SelectItem key={promotion.id} value={promotion.code}>
												{promotion.name} ({promotion.code})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* additional_info.show_features */}
				<Card>
					<CardHeader>
						<CardTitle>Show Features</CardTitle>
						<CardDescription>
							Feature details for the show (additional_info.show_features)
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="show_features_title">Features Title</Label>
							<Input
								id="show_features_title"
								value={show.show_features_title}
								onChange={(e) => setShow({ ...show, show_features_title: e.target.value })}
								placeholder="What to expect when attending this show"
								disabled={loading}
							/>
						</div>
						<div className="space-y-2">
							<Label>Feature Details</Label>
							<Select
								key={showFeatureSelectKey}
								onValueChange={(value: string) => {
									if (value) {
										handleAddShowFeature(value);
									}
								}}
								disabled={loading}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select a feature..." />
								</SelectTrigger>
								<SelectContent className="w-(--radix-select-trigger-width)">
									{availableShowFeatures.map((feature) => {
										const isSelected = show.show_features_details.some((f) => f.id === feature.id);
										return (
											<SelectItem
												key={feature.id}
												value={feature.id.toString()}
												disabled={isSelected}
												className={isSelected ? "opacity-60" : ""}
											>
												<div className="flex items-center gap-3 w-full py-1">
													{isSelected && <Check className="h-4 w-4 shrink-0" />}
													{feature.img_url && (
														<div className="relative h-10 w-14 overflow-hidden rounded border bg-muted shrink-0">
															<Image
																src={feature.img_url}
																alt={feature.title}
																fill
																className="object-cover"
																unoptimized
															/>
														</div>
													)}
													<div className="flex-1 min-w-0">
														<div className="font-medium truncate">{feature.title}</div>
														{feature.description && (
															<div className="text-xs text-muted-foreground truncate">
																{feature.description}
															</div>
														)}
													</div>
												</div>
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
							<div className="space-y-2 mt-2">
								{show.show_features_details.map((feature, index) => (
									<div key={index} className="flex items-start gap-2 p-3 border rounded-md">
										{feature.img_url && (
											<div className="relative h-12 w-16 overflow-hidden rounded-md border bg-muted shrink-0">
												<Image
													src={feature.img_url}
													alt={feature.title}
													fill
													className="object-cover"
													unoptimized
												/>
											</div>
										)}
										<div className="flex-1 space-y-1">
											<div className="font-medium">{feature.title}</div>
											{feature.description && (
												<div className="text-sm text-muted-foreground">{feature.description}</div>
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
									onChange={(e) => setShow({ ...show, story_title: e.target.value })}
									placeholder="Sir Elton – At the Piano: The Music of Elton John"
									disabled={loading}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="story_sub_title">Story Sub Title</Label>
								<Input
									id="story_sub_title"
									value={show.story_sub_title}
									onChange={(e) => setShow({ ...show, story_sub_title: e.target.value })}
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
								onChange={(e) => setShow({ ...show, story_description: e.target.value })}
								placeholder="Sir Elton is a powerful and personal live tribute to the legendary music of Elton John..."
								disabled={loading}
								rows={12}
								className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="story_enable_description">Enable Description</Label>
							<Select
								value={show.story_enable_description}
								onValueChange={(value: string) => {
									setShow({ ...show, story_enable_description: value });
								}}
								disabled={loading}
							>
								<SelectTrigger id="story_enable_description" className="w-full">
									<SelectValue placeholder="Select..." />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="yes">Yes</SelectItem>
									<SelectItem value="no">No</SelectItem>
								</SelectContent>
							</Select>
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
											<div className="text-sm text-muted-foreground">{member.description}</div>
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
						<CardDescription>Add multiple images and videos for the show gallery</CardDescription>
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
								Select Images
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => setGalleryVideoModalOpen(true)}
								disabled={loading}
							>
								<Plus className="h-4 w-4 mr-2" />
								Select Videos
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
						<CardDescription>
							Venue details are automatically loaded from the selected venue
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{show.venue_id ? (
							<div className="rounded-md border bg-muted/50 p-4 space-y-2">
								<p className="text-sm text-muted-foreground">
									Venue information is automatically populated from the selected venue. To change
									venue details, edit the venue in the Venues section.
								</p>
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<span className="font-medium">Title:</span> {show.venue_title || "—"}
									</div>
									<div>
										<span className="font-medium">Sub Title:</span> {show.venue_sub_title || "—"}
									</div>
									<div className="col-span-2">
										<span className="font-medium">Description:</span>{" "}
										{show.venue_description ? (
											<span className="line-clamp-2">{show.venue_description}</span>
										) : (
											"—"
										)}
									</div>
									<div>
										<span className="font-medium">Image URL:</span>{" "}
										{show.venue_img_url ? (
											<span className="truncate block">{show.venue_img_url}</span>
										) : (
											"—"
										)}
									</div>
									<div>
										<span className="font-medium">Link:</span>{" "}
										{show.venue_link ? (
											<span className="truncate block">{show.venue_link}</span>
										) : (
											"—"
										)}
									</div>
								</div>
							</div>
						) : (
							<div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
								Please select a venue from the &quot;Venue & Category&quot; section above to load
								venue details.
							</div>
						)}
						<div className="space-y-2">
							<Label htmlFor="venue_google_map">Google Map Embed HTML</Label>
							<textarea
								id="venue_google_map"
								value={show.venue_google_map}
								onChange={(e) => setShow({ ...show, venue_google_map: e.target.value })}
								placeholder='&lt;div style="width: 100%"&gt;&lt;iframe width="100%" height="600"...&lt;/div&gt;'
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
								onChange={(e) => setShow({ ...show, venue_seat_map: e.target.value })}
								placeholder=""
								disabled={loading}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="venue_enable_venue">Enable Venue</Label>
							<Select
								value={show.venue_enable_venue}
								onValueChange={(value: string) => {
									setShow({ ...show, venue_enable_venue: value });
								}}
								disabled={loading}
							>
								<SelectTrigger id="venue_enable_venue" className="w-full">
									<SelectValue placeholder="Select..." />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="yes">Yes</SelectItem>
									<SelectItem value="no">No</SelectItem>
								</SelectContent>
							</Select>
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
									<div key={index} className="flex items-start gap-2 p-3 border rounded-md">
										<div className="flex-1 space-y-1">
											<div className="font-medium">{detail.title}</div>
											<div className="text-sm text-muted-foreground">{detail.description}</div>
											{detail.link_url && (
												<div className="text-xs text-muted-foreground">Link: {detail.link_url}</div>
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
								onChange={(e) => setShow({ ...show, yoast_focuskw: e.target.value })}
								placeholder="Elton John Vegas"
								disabled={loading}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="yoast_focuskeywords">Focus Keywords</Label>
							<Input
								id="yoast_focuskeywords"
								value={show.yoast_focuskeywords}
								onChange={(e) => setShow({ ...show, yoast_focuskeywords: e.target.value })}
								placeholder="Elton John, Jeff Burkett, Sir Elton"
								disabled={loading}
							/>
							<p className="text-xs text-muted-foreground">Multiple keywords separated by commas</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="yoast_metadesc">Meta Description</Label>
							<textarea
								id="yoast_metadesc"
								value={show.yoast_metadesc}
								onChange={(e) => setShow({ ...show, yoast_metadesc: e.target.value })}
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
								onChange={(e) => setShow({ ...show, yoast_title: e.target.value })}
								placeholder="title"
								disabled={loading}
							/>
							<p className="text-xs text-muted-foreground">Use title to insert the show title</p>
						</div>
					</CardContent>
				</Card>

				{/* Form Actions */}
				<div className="flex justify-end gap-4 pt-4">
					<Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
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
				onSaveMultiple={handleAddGalleryMediaMultiple}
				type="image"
				multiple={true}
			/>
			<GalleryMediaModal
				isOpen={galleryVideoModalOpen}
				onClose={() => setGalleryVideoModalOpen(false)}
				onSave={handleAddGalleryMedia}
				onSaveMultiple={handleAddGalleryMediaMultiple}
				type="video"
				multiple={true}
			/>

			{/* Image Select Modals */}
			<ImageSelectModal
				isOpen={imageModalOpen === "image_url"}
				onClose={() => setImageModalOpen(null)}
				onSelect={handleImageSelect}
				currentImageUrl={show.image_url}
			/>
			<ImageSelectModal
				isOpen={imageModalOpen === "cover_image"}
				onClose={() => setImageModalOpen(null)}
				onSelect={handleImageSelect}
				currentImageUrl={show.cover_image}
			/>
			<ImageSelectModal
				isOpen={imageModalOpen === "portrait_image"}
				onClose={() => setImageModalOpen(null)}
				onSelect={handleImageSelect}
				currentImageUrl={show.portrait_image}
			/>
		</div>
	);
}
