"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2, Check, X } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export default function EditEventPage() {
	const router = useRouter();
	const params = useParams();
	const id = params?.id as string;
	const isNew = id === "new";
	const [loading, setLoading] = useState(false);

	// Available options from database
	const [availableShows, setAvailableShows] = useState<Array<{ id: number; name: string }>>([]);
	const [availablePromotions, setAvailablePromotions] = useState<
		Array<{ id: number; promotion_id: number | null; name: string; code: string }>
	>([]);
	const [availablePriceLevels, setAvailablePriceLevels] = useState<
		Array<{ id: number; price_level_id: number | null; name: string; label: string | null }>
	>([]);

	// Keys to reset Select components
	const [promotionSelectKey, setPromotionSelectKey] = useState(0);
	const [priceLevelSelectKey, setPriceLevelSelectKey] = useState(0);

	const [dateMode, setDateMode] = useState<"single" | "multiple">("single");
	const [event, setEvent] = useState({
		show_id: null as number | null,
		name: "",
		description: "",
		event_date: "",
		event_end_date: "",
		status: "active",
		promotions: [] as Array<{
			id?: number;
			promotion_id: number;
			name: string;
			code: string;
			priceBlocks: Array<{
				price_level_id: number;
				price_level_name: string;
				fullRetailPrice: string;
				fullPurchasePrice: string;
			}>;
		}>,
		price_levels: [] as Array<{
			id?: number;
			price_level_id: number;
			name: string;
			label: string | null;
			availability: string; // seats available for this price level
		}>,
	});

	// Load event data
	const loadEvent = useCallback(async () => {
		if (isNew) return;

		try {
			setLoading(true);
			const { data, error } = await supabase
				.from("events")
				.select("*")
				.eq("id", parseInt(id))
				.single();

			if (error) {
				console.error("Error loading event:", error);
				toast.error("Failed to load event: " + error.message);
				return;
			}

			if (data) {
				// Determine date mode based on whether end_date exists
				const hasEndDate = data.event_end_date && data.event_end_date !== data.event_date;
				setDateMode(hasEndDate ? "multiple" : "single");

				setEvent({
					show_id: data.show_id,
					name: data.name || "",
					description: data.description || "",
					event_date: data.event_date ? new Date(data.event_date).toISOString().slice(0, 10) : "",
					event_end_date: data.event_end_date
						? new Date(data.event_end_date).toISOString().slice(0, 10)
						: "",
					status: data.status || "active",
					promotions:
						(
							data.promotions as Array<{
								id?: number;
								promotion_id: number;
								name: string;
								code: string;
								priceBlocks?: Array<{
									price_level_id: number;
									price_level_name: string;
									fullRetailPrice: number | string;
									fullPurchasePrice: number | string;
								}>;
							}>
						).map((promo) => ({
							...promo,
							priceBlocks: (promo.priceBlocks || []).map((pb) => ({
								...pb,
								fullRetailPrice: pb.fullRetailPrice?.toString() || "",
								fullPurchasePrice: pb.fullPurchasePrice?.toString() || "",
							})),
						})) || [],
					price_levels:
						(
							data.price_levels as Array<{
								id?: number;
								price_level_id: number;
								name: string;
								label: string | null;
								availability?: number | string | null;
							}>
						)?.map((pl) => ({
							...pl,
							availability:
								pl.availability !== undefined && pl.availability !== null
									? pl.availability.toString()
									: "",
						})) || [],
				});
			}
		} catch (error) {
			console.error("Unexpected error:", error);
			toast.error("Failed to load event");
		} finally {
			setLoading(false);
		}
	}, [id, isNew]);

	useEffect(() => {
		if (!isNew) {
			void loadEvent();
		}
	}, [isNew, loadEvent]);

	// Load available options
	useEffect(() => {
		const loadShows = async () => {
			const { data } = await supabase.from("shows").select("id, title, data").order("title");
			if (data) {
				// Transform shows data to include name from title or data.name
				const transformedShows = data.map((show) => {
					const showData = (show.data as Record<string, unknown> | null) || {};
					const name =
						(show.title as string) ||
						(showData.title as string) ||
						(showData.name as string) ||
						"Untitled Show";
					return { id: show.id, name };
				});
				setAvailableShows(transformedShows);
			}
		};

		const loadPromotions = async () => {
			const { data } = await supabase
				.from("promotions")
				.select("id, promotion_id, name, code, status")
				.eq("status", "active")
				.order("name");
			if (data) setAvailablePromotions(data);
		};

		const loadPriceLevels = async () => {
			const { data } = await supabase
				.from("price_levels")
				.select("id, price_level_id, name, label, status")
				.eq("status", "active")
				.order("name");
			if (data) setAvailablePriceLevels(data);
		};

		void loadShows();
		void loadPromotions();
		void loadPriceLevels();
	}, []);

	// Load show data and inherit price levels and promotions when show is selected
	useEffect(() => {
		const loadShowData = async () => {
			if (!event.show_id || !isNew) return; // Only inherit when creating new event

			try {
				const { data: showData, error } = await supabase
					.from("shows")
					.select("id, title, data")
					.eq("id", event.show_id)
					.single();

				if (error || !showData) {
					console.error("Error loading show data:", error);
					return;
				}

				const showDataJson = (showData.data as Record<string, unknown> | null) || {};
				const showTitle =
					(showData.title as string) ||
					(showDataJson.title as string) ||
					(showDataJson.name as string) ||
					"";

				// Extract promotions and price levels from show's data JSONB
				// They are stored in: data.additional_info.venue.venue_series_data.promotions/priceLevels
				const additionalInfo =
					(showDataJson.additional_info as Record<string, unknown> | null) || {};
				const venue = (additionalInfo.venue as Record<string, unknown> | null) || {};
				const venueSeriesData = (venue.venue_series_data as Record<string, unknown> | null) || {};

				// Extract promotions from nested structure
				let showPromotions: Array<{
					id?: number;
					promotion_id: number;
					name: string;
					code: string;
				}> = [];

				if (Array.isArray(venueSeriesData.promotions)) {
					// Promotions in venue_series_data format: [{id, name, code}]
					showPromotions = (
						venueSeriesData.promotions as Array<{
							id: number;
							name: string;
							code: string;
						}>
					).map((p) => ({
						promotion_id: p.id,
						name: p.name,
						code: p.code,
					}));
				} else if (Array.isArray(showDataJson.promotions)) {
					// Fallback: check if promotions are stored directly in data root
					showPromotions = showDataJson.promotions as Array<{
						id?: number;
						promotion_id: number;
						name: string;
						code: string;
					}>;
				}

				// Extract price levels from nested structure
				let showPriceLevels: Array<{
					id?: number;
					price_level_id: number;
					name: string;
					label: string | null;
					availability?: string;
				}> = [];

				if (Array.isArray(venueSeriesData.priceLevels)) {
					// Price levels in venue_series_data format: [{id, name, label}]
					showPriceLevels = (
						venueSeriesData.priceLevels as Array<{
							id: number;
							name: string;
							label?: string | null;
						}>
					).map((pl) => ({
						price_level_id: pl.id,
						name: pl.name,
						label: pl.label || null,
						availability: "",
					}));
				} else if (Array.isArray(showDataJson.price_levels)) {
					// Fallback: check if price_levels are stored directly in data root
					showPriceLevels = (
						showDataJson.price_levels as Array<{
							id?: number;
							price_level_id: number;
							name: string;
							label: string | null;
							availability?: number | string;
						}>
					).map((pl) => ({
						...pl,
						availability: pl.availability?.toString() || "",
					}));
				}

				// Initialize promotions with priceBlocks for all price levels
				const initializedPromotions = showPromotions.map((promo) => ({
					...promo,
					priceBlocks: showPriceLevels.map((pl) => ({
						price_level_id: pl.price_level_id,
						price_level_name: pl.name,
						fullRetailPrice: "",
						fullPurchasePrice: "",
					})),
				}));

				// Ensure all price levels have availability as string
				const priceLevelsWithAvailability = showPriceLevels.map((pl) => ({
					...pl,
					availability: pl.availability || "",
				}));

				// Update event with inherited data
				setEvent((prev) => ({
					...prev,
					name: prev.name || showTitle, // Set name if empty
					promotions: initializedPromotions.length > 0 ? initializedPromotions : prev.promotions, // Inherit promotions with priceBlocks
					price_levels:
						priceLevelsWithAvailability.length > 0
							? priceLevelsWithAvailability
							: prev.price_levels, // Inherit price levels
				}));

				if (showPromotions.length > 0 || showPriceLevels.length > 0) {
					toast.success(
						`Inherited ${showPromotions.length} promotion(s) and ${showPriceLevels.length} price level(s) from show`
					);
				}
			} catch (error) {
				console.error("Error loading show data:", error);
			}
		};

		void loadShowData();
	}, [event.show_id, isNew]);

	// Helper function to get all dates in a range
	const getDatesInRange = (startDate: string, endDate: string): string[] => {
		const dates: string[] = [];
		const start = new Date(startDate);
		const end = new Date(endDate);

		for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
			dates.push(d.toISOString().slice(0, 10));
		}

		return dates;
	};

	// Check for duplicate events
	const checkDuplicateEvents = async (showId: number, dates: string[]): Promise<string[]> => {
		const conflictingDates: string[] = [];

		for (const date of dates) {
			const { data, error } = await supabase
				.from("events")
				.select("id, event_date")
				.eq("show_id", showId)
				.eq("event_date", date)
				.maybeSingle();

			if (error) {
				console.error("Error checking duplicate:", error);
				continue;
			}

			// If creating new event, any existing event is a conflict
			// If editing existing event, only conflict if it's a different event
			if (data) {
				if (isNew || data.id !== parseInt(id)) {
					conflictingDates.push(date);
				}
			}
		}

		return conflictingDates;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (!event.show_id) {
				toast.error("Please select a show");
				setLoading(false);
				return;
			}

			if (!event.event_date) {
				toast.error("Please select a date");
				setLoading(false);
				return;
			}

			// Convert priceBlocks prices from strings to numbers for storage
			const promotionsWithNumericPrices = event.promotions.map((promo) => ({
				id: promo.id,
				promotion_id: promo.promotion_id,
				name: promo.name,
				code: promo.code,
				priceBlocks: promo.priceBlocks.map((pb) => ({
					price_level_id: pb.price_level_id,
					price_level_name: pb.price_level_name,
					fullRetailPrice: pb.fullRetailPrice ? parseFloat(pb.fullRetailPrice) : null,
					fullPurchasePrice: pb.fullPurchasePrice ? parseFloat(pb.fullPurchasePrice) : null,
				})),
			}));

			// Convert price levels with ticket availability from strings to numbers
			const priceLevelsWithNumericAvailability = event.price_levels.map((pl) => ({
				id: pl.id,
				price_level_id: pl.price_level_id,
				name: pl.name,
				label: pl.label,
				availability: pl.availability ? parseInt(pl.availability) : null,
			}));

			// Determine dates to create events for
			let datesToCreate: string[] = [];
			if (dateMode === "single") {
				datesToCreate = [event.event_date];
			} else {
				if (!event.event_end_date) {
					toast.error("Please select an end date for multiple dates");
					setLoading(false);
					return;
				}
				if (new Date(event.event_end_date) < new Date(event.event_date)) {
					toast.error("End date must be after start date");
					setLoading(false);
					return;
				}
				datesToCreate = getDatesInRange(event.event_date, event.event_end_date);
			}

			// Check for duplicate events
			const conflictingDates = await checkDuplicateEvents(event.show_id, datesToCreate);

			if (isNew) {
				// For single date mode: if conflict exists, show error and don't create
				if (dateMode === "single" && conflictingDates.length > 0) {
					const dateStr = new Date(conflictingDates[0]).toLocaleDateString();
					toast.error(`Event already exists for this show on ${dateStr}`);
					setLoading(false);
					return;
				}

				// For multiple date mode: filter out conflicting dates
				const datesToCreateFiltered = datesToCreate.filter(
					(date) => !conflictingDates.includes(date)
				);

				if (datesToCreateFiltered.length === 0) {
					const datesStr = conflictingDates.map((d) => new Date(d).toLocaleDateString()).join(", ");
					toast.error(`All selected dates already have events for this show: ${datesStr}`);
					setLoading(false);
					return;
				}

				// Create events only for non-conflicting dates
				const eventsToCreate = datesToCreateFiltered.map((date) => ({
					show_id: event.show_id,
					name: event.name,
					description: event.description || null,
					event_date: date,
					event_end_date: null, // Single date per event
					status: event.status,
					promotions: promotionsWithNumericPrices,
					price_levels: priceLevelsWithNumericAvailability,
				}));

				const { data, error } = await supabase.from("events").insert(eventsToCreate).select();

				if (error) {
					console.error("Error creating events:", error);
					toast.error("Failed to create events: " + error.message);
					return;
				}

				if (data && data.length > 0) {
					// Show success message with info about skipped dates
					if (conflictingDates.length > 0) {
						const skippedStr = conflictingDates
							.map((d) => new Date(d).toLocaleDateString())
							.join(", ");
						toast.success(
							`Successfully created ${data.length} event(s). Skipped ${conflictingDates.length} date(s) that already exist: ${skippedStr}`
						);
					} else {
						toast.success(`Successfully created ${data.length} event(s)`);
					}
					router.push(`/dashboard/events/${data[0].id}`);
				}
			} else {
				// Update existing event (only single date for editing)
				const eventData = {
					show_id: event.show_id,
					name: event.name,
					description: event.description || null,
					event_date: event.event_date,
					event_end_date: null, // Single date per event
					status: event.status,
					promotions: promotionsWithNumericPrices,
					price_levels: priceLevelsWithNumericAvailability,
				};

				const { error } = await supabase.from("events").update(eventData).eq("id", parseInt(id));

				if (error) {
					console.error("Error updating event:", error);
					toast.error("Failed to update event: " + error.message);
					return;
				}

				toast.success("Event updated successfully");
				void loadEvent();
			}
		} catch (error) {
			console.error("Unexpected error:", error);
			toast.error("Failed to save event");
		} finally {
			setLoading(false);
		}
	};

	const handleAddPromotion = (promotionId: string) => {
		const promotion = availablePromotions.find((p) => p.id.toString() === promotionId);
		if (!promotion) return;

		if (event.promotions.some((p) => p.promotion_id === promotion.promotion_id)) {
			toast.error("Promotion already added");
			return;
		}

		// Create priceBlocks for all existing price levels
		const priceBlocks = event.price_levels.map((pl) => ({
			price_level_id: pl.price_level_id,
			price_level_name: pl.name,
			fullRetailPrice: "",
			fullPurchasePrice: "",
		}));

		setEvent({
			...event,
			promotions: [
				...event.promotions,
				{
					id: promotion.id,
					promotion_id: promotion.promotion_id || Date.now(),
					name: promotion.name,
					code: promotion.code,
					priceBlocks: priceBlocks,
				},
			],
		});
		setPromotionSelectKey((prev) => prev + 1);
	};

	const removePromotion = (index: number) => {
		setEvent({
			...event,
			promotions: event.promotions.filter((_, i) => i !== index),
		});
	};

	const handleAddPriceLevel = (priceLevelId: string) => {
		const priceLevel = availablePriceLevels.find((pl) => pl.id.toString() === priceLevelId);
		if (!priceLevel) return;

		if (event.price_levels.some((pl) => pl.price_level_id === priceLevel.price_level_id)) {
			toast.error("Price level already added");
			return;
		}

		const newPriceLevel = {
			id: priceLevel.id,
			price_level_id: priceLevel.price_level_id || Date.now(),
			name: priceLevel.name,
			label: priceLevel.label,
			availability: "",
		};

		// Add the new price level to all existing promotions' priceBlocks
		const updatedPromotions = event.promotions.map((promo) => ({
			...promo,
			priceBlocks: [
				...promo.priceBlocks,
				{
					price_level_id: newPriceLevel.price_level_id,
					price_level_name: newPriceLevel.name,
					fullRetailPrice: "",
					fullPurchasePrice: "",
				},
			],
		}));

		setEvent({
			...event,
			price_levels: [...event.price_levels, newPriceLevel],
			promotions: updatedPromotions,
		});
		setPriceLevelSelectKey((prev) => prev + 1);
	};

	const removePriceLevel = (index: number) => {
		const priceLevelToRemove = event.price_levels[index];
		if (!priceLevelToRemove) return;

		// Remove the price level from all promotions' priceBlocks
		const updatedPromotions = event.promotions.map((promo) => ({
			...promo,
			priceBlocks: promo.priceBlocks.filter(
				(pb) => pb.price_level_id !== priceLevelToRemove.price_level_id
			),
		}));

		setEvent({
			...event,
			price_levels: event.price_levels.filter((_, i) => i !== index),
			promotions: updatedPromotions,
		});
	};

	const updatePriceBlock = (
		promotionIndex: number,
		priceBlockIndex: number,
		field: "fullRetailPrice" | "fullPurchasePrice",
		value: string
	) => {
		const updatedPromotions = [...event.promotions];
		updatedPromotions[promotionIndex] = {
			...updatedPromotions[promotionIndex],
			priceBlocks: [...updatedPromotions[promotionIndex].priceBlocks],
		};
		updatedPromotions[promotionIndex].priceBlocks[priceBlockIndex] = {
			...updatedPromotions[promotionIndex].priceBlocks[priceBlockIndex],
			[field]: value,
		};

		setEvent({
			...event,
			promotions: updatedPromotions,
		});
	};

	const updatePriceLevelAvailability = (priceLevelIndex: number, value: string) => {
		const updatedPriceLevels = [...event.price_levels];
		updatedPriceLevels[priceLevelIndex] = {
			...updatedPriceLevels[priceLevelIndex],
			availability: value,
		};
		setEvent({
			...event,
			price_levels: updatedPriceLevels,
		});
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Link href="/dashboard/events">
						<Button variant="outline" size="sm">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back
						</Button>
					</Link>
					<div>
						<h1 className="text-3xl font-bold tracking-tight">
							{isNew ? "Create Event" : "Edit Event"}
						</h1>
						<p className="text-muted-foreground">
							{isNew ? "Create a new event for a show" : "Update event details"}
						</p>
					</div>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Basic Information */}
				<Card>
					<CardHeader>
						<CardTitle>Basic Information</CardTitle>
						<CardDescription>Event name, description, and show association</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="show_id">Show *</Label>
							<Select
								value={event.show_id?.toString() || ""}
								onValueChange={(value) =>
									setEvent({ ...event, show_id: value ? parseInt(value) : null })
								}
								disabled={loading || !isNew}
							>
								<SelectTrigger id="show_id" className="w-full">
									<SelectValue placeholder="Select a show..." />
								</SelectTrigger>
								<SelectContent>
									{availableShows.map((show) => (
										<SelectItem key={show.id} value={show.id.toString()}>
											{show.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="name">Event Name *</Label>
							<Input
								id="name"
								value={event.name}
								onChange={(e) => setEvent({ ...event, name: e.target.value })}
								placeholder="Event name"
								disabled={loading}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<textarea
								id="description"
								value={event.description}
								onChange={(e) => setEvent({ ...event, description: e.target.value })}
								placeholder="Event description"
								disabled={loading}
								rows={4}
								className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
							/>
						</div>
					</CardContent>
				</Card>

				{/* Date */}
				<Card>
					<CardHeader>
						<CardTitle>Date</CardTitle>
						<CardDescription>
							{isNew
								? "Select a single date or a date range to create multiple events"
								: "Event date (editing single event)"}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{isNew && (
							<div className="space-y-2">
								<Label htmlFor="date_mode">Date Mode *</Label>
								<Select
									value={dateMode}
									onValueChange={(value: "single" | "multiple") => {
										setDateMode(value);
										if (value === "single") {
											setEvent({ ...event, event_end_date: "" });
										}
									}}
									disabled={loading}
								>
									<SelectTrigger id="date_mode">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="single">Single Date</SelectItem>
										<SelectItem value="multiple">Multiple Dates (Range)</SelectItem>
									</SelectContent>
								</Select>
							</div>
						)}
						<div className={dateMode === "multiple" && isNew ? "grid grid-cols-2 gap-4" : ""}>
							<div className="space-y-2">
								<Label htmlFor="event_date">
									{dateMode === "multiple" ? "Start Date *" : "Event Date *"}
								</Label>
								<Input
									id="event_date"
									type="date"
									value={event.event_date}
									onChange={(e) => setEvent({ ...event, event_date: e.target.value })}
									disabled={loading}
									required
								/>
							</div>
							{dateMode === "multiple" && isNew && (
								<div className="space-y-2">
									<Label htmlFor="event_end_date">End Date *</Label>
									<Input
										id="event_end_date"
										type="date"
										value={event.event_end_date}
										onChange={(e) => setEvent({ ...event, event_end_date: e.target.value })}
										disabled={loading}
										required
										min={event.event_date}
									/>
								</div>
							)}
						</div>
						{dateMode === "multiple" && isNew && event.event_date && event.event_end_date && (
							<div className="text-sm text-muted-foreground">
								{(() => {
									const dates = getDatesInRange(event.event_date, event.event_end_date);
									return `This will create ${dates.length} event(s) for dates: ${dates
										.map((d) => new Date(d).toLocaleDateString())
										.join(", ")}`;
								})()}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Price Levels */}
				<Card>
					<CardHeader>
						<CardTitle>Price Levels</CardTitle>
						<CardDescription>
							Add price levels for this event. Each promotion will include all price levels.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2 w-full">
							<Label>Price Levels</Label>
							<Select
								key={priceLevelSelectKey}
								onValueChange={(value: string) => {
									if (value) {
										handleAddPriceLevel(value);
										setPriceLevelSelectKey((prev: number) => prev + 1);
									}
								}}
								disabled={loading}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select a price level..." />
								</SelectTrigger>
								<SelectContent className="w-[var(--radix-select-trigger-width)]">
									{availablePriceLevels.map((priceLevel) => {
										const isSelected = event.price_levels.some(
											(pl) => pl.price_level_id === priceLevel.price_level_id
										);
										return (
											<SelectItem
												key={priceLevel.id}
												value={priceLevel.id.toString()}
												disabled={isSelected}
											>
												<div className="flex items-center justify-between w-full">
													<span>
														{priceLevel.name} {priceLevel.label && `(${priceLevel.label})`}
													</span>
													{isSelected && <Check className="h-4 w-4 ml-2 flex-shrink-0" />}
												</div>
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
							{event.price_levels.length > 0 && (
								<div className="space-y-3 mt-2">
									{event.price_levels.map((pl, index) => (
										<div
											key={index}
											className="grid grid-cols-3 gap-3 items-end bg-muted/50 rounded-md p-3"
										>
											<div>
												<div className="font-medium text-sm">
													{pl.name} {pl.label && `(${pl.label})`}
												</div>
												<div className="text-xs text-muted-foreground">
													Price level ID: {pl.price_level_id}
												</div>
											</div>
											<div className="space-y-1">
												<Label
													htmlFor={`pl-availability-${index}`}
													className="text-xs text-muted-foreground"
												>
													Seats (availability)
												</Label>
												<Input
													id={`pl-availability-${index}`}
													type="number"
													min="0"
													placeholder="0"
													value={pl.availability ?? ""}
													onChange={(e) => updatePriceLevelAvailability(index, e.target.value)}
													disabled={loading}
												/>
											</div>
											<div className="flex justify-end">
												<Button
													type="button"
													variant="ghost"
													size="icon"
													onClick={() => removePriceLevel(index)}
													className="text-destructive hover:text-destructive/80"
												>
													<X className="h-4 w-4" />
												</Button>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Promotions & Pricing */}
				<Card>
					<CardHeader>
						<CardTitle>Promotions & Pricing</CardTitle>
						<CardDescription>
							Add promotions and set prices for each price level. Each promotion includes all price
							levels.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-2 w-full">
							<Label>Add Promotion</Label>
							<Select
								key={promotionSelectKey}
								onValueChange={(value: string) => {
									if (value) {
										handleAddPromotion(value);
										setPromotionSelectKey((prev: number) => prev + 1);
									}
								}}
								disabled={loading || event.price_levels.length === 0}
							>
								<SelectTrigger className="w-full">
									<SelectValue
										placeholder={
											event.price_levels.length === 0
												? "Add price levels first..."
												: "Select a promotion..."
										}
									/>
								</SelectTrigger>
								<SelectContent className="w-[var(--radix-select-trigger-width)]">
									{availablePromotions.map((promotion) => {
										const isSelected = event.promotions.some(
											(p) => p.promotion_id === promotion.promotion_id
										);
										return (
											<SelectItem
												key={promotion.id}
												value={promotion.id.toString()}
												disabled={isSelected}
											>
												<div className="flex items-center justify-between w-full">
													<span>
														{promotion.name} ({promotion.code})
													</span>
													{isSelected && <Check className="h-4 w-4 ml-2 flex-shrink-0" />}
												</div>
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
							{event.price_levels.length === 0 && (
								<p className="text-sm text-muted-foreground">
									Please add price levels first before adding promotions.
								</p>
							)}
						</div>

						{event.promotions.length > 0 && (
							<div className="space-y-6">
								{event.promotions.map((promo, promoIndex) => (
									<div key={promoIndex} className="border rounded-lg p-4 space-y-4">
										<div className="flex items-center justify-between">
											<div>
												<h4 className="font-semibold">{promo.name}</h4>
												<p className="text-sm text-muted-foreground">Code: {promo.code}</p>
											</div>
											<button
												type="button"
												onClick={() => removePromotion(promoIndex)}
												className="text-destructive hover:text-destructive/80"
											>
												<X className="h-4 w-4" />
											</button>
										</div>

										{event.price_levels.length > 0 ? (
											<div className="space-y-3">
												<div className="text-sm font-medium">Pricing for Price Levels:</div>
												<div className="grid gap-4">
													{promo.priceBlocks.map((priceBlock, pbIndex) => {
														const priceLevel = event.price_levels.find(
															(pl) => pl.price_level_id === priceBlock.price_level_id
														);
														if (!priceLevel) return null;

														return (
															<div
																key={pbIndex}
																className="grid grid-cols-3 gap-4 items-end border-b pb-3"
															>
																<div>
																	<Label className="text-sm font-medium">
																		{priceLevel.name} {priceLevel.label && `(${priceLevel.label})`}
																	</Label>
																</div>
																<div className="space-y-1">
																	<Label
																		htmlFor={`retail-${promoIndex}-${pbIndex}`}
																		className="text-xs text-muted-foreground"
																	>
																		Full Retail Price
																	</Label>
																	<Input
																		id={`retail-${promoIndex}-${pbIndex}`}
																		type="number"
																		step="0.01"
																		value={priceBlock.fullRetailPrice}
																		onChange={(e) =>
																			updatePriceBlock(
																				promoIndex,
																				pbIndex,
																				"fullRetailPrice",
																				e.target.value
																			)
																		}
																		placeholder="0.00"
																		disabled={loading}
																		min="0"
																	/>
																</div>
																<div className="space-y-1">
																	<Label
																		htmlFor={`purchase-${promoIndex}-${pbIndex}`}
																		className="text-xs text-muted-foreground"
																	>
																		Full Purchase Price
																	</Label>
																	<Input
																		id={`purchase-${promoIndex}-${pbIndex}`}
																		type="number"
																		step="0.01"
																		value={priceBlock.fullPurchasePrice}
																		onChange={(e) =>
																			updatePriceBlock(
																				promoIndex,
																				pbIndex,
																				"fullPurchasePrice",
																				e.target.value
																			)
																		}
																		placeholder="0.00"
																		disabled={loading}
																		min="0"
																	/>
																</div>
															</div>
														);
													})}
												</div>
											</div>
										) : (
											<p className="text-sm text-muted-foreground">No price levels added yet.</p>
										)}
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Status */}
				<Card>
					<CardHeader>
						<CardTitle>Status</CardTitle>
						<CardDescription>Event status</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="status">Status</Label>
							<Select
								value={event.status}
								onValueChange={(value) => setEvent({ ...event, status: value })}
								disabled={loading}
							>
								<SelectTrigger id="status" className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="cancelled">Cancelled</SelectItem>
									<SelectItem value="sold_out">Sold Out</SelectItem>
									<SelectItem value="draft">Draft</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>

				<div className="flex justify-end gap-4">
					<Link href="/dashboard/events">
						<Button type="button" variant="outline" disabled={loading}>
							Cancel
						</Button>
					</Link>
					<Button type="submit" disabled={loading}>
						{loading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Saving...
							</>
						) : (
							<>
								<Save className="mr-2 h-4 w-4" />
								{isNew ? "Create Event" : "Save Changes"}
							</>
						)}
					</Button>
				</div>
			</form>
		</div>
	);
}
