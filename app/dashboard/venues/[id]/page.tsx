"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, ImageIcon } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { ImageSelectModal } from "./_components/ImageSelectModal";
import { TIMEZONES, CURRENCY_LOCALES, getCurrencySymbol, COUNTRIES } from "@/lib/constants/venues";

export default function EditVenuePage() {
	const router = useRouter();
	const params = useParams();
	const id = params?.id as string;
	const [loading, setLoading] = useState(false);
	const [imageModalOpen, setImageModalOpen] = useState(false);
	const [venue, setVenue] = useState({
		name: "",
		external_venue_id: "",
		address1: "",
		address2: "",
		city: "",
		state: "",
		postal_code: "",
		country: "",
		currency_symbol: "$",
		currency_locale: "en-US",
		timezone: "",
		timezone_info: null as {
			id: string;
			displayName: string;
			baseUtcOffset: string;
			currentUtcOffset: string;
		} | null,
		img_src: "",
		description: "",
		venue_url: "",
		status: "active",
	});

	const loadVenue = useCallback(async () => {
		setLoading(true);
		try {
			const { data, error } = await supabase.from("venues").select("*").eq("id", id).maybeSingle();

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

			// Map timezone to timezone_info structure
			const timezoneInfo = data.timezone
				? {
						id: data.timezone_info?.id || "Pacific Standard Time",
						displayName: data.timezone || "",
						baseUtcOffset: data.timezone_info?.baseUtcOffset || "-08:00:00",
						currentUtcOffset: data.timezone_info?.currentUtcOffset || "-08:00:00",
					}
				: null;

			setVenue({
				name: data.name ?? "",
				external_venue_id: data.external_venue_id ?? "",
				address1: data.address1 ?? "",
				address2: data.address2 ?? "",
				city: data.city ?? "",
				state: data.state ?? "",
				postal_code: data.postal_code ?? "",
				country: data.country ?? "",
				currency_symbol: data.currency_symbol ?? "$",
				currency_locale: data.currency_locale ?? "en-US",
				timezone: data.timezone ?? "",
				timezone_info: timezoneInfo,
				img_src: data.img_src ?? "",
				description: data.description ?? "",
				venue_url: data.venue_url ?? "",
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
			// Build timezone_info object if timezone is provided
			const timezoneInfo = venue.timezone
				? {
						id: "Pacific Standard Time", // Default, can be updated based on timezone
						displayName: venue.timezone,
						baseUtcOffset: "-08:00:00", // Default, can be parsed from timezone
						currentUtcOffset: "-08:00:00", // Default, can be parsed from timezone
					}
				: null;

			const payload: Record<string, unknown> = {
				name: venue.name || null,
				external_venue_id: venue.external_venue_id || null,
				address1: venue.address1 || null,
				address2: venue.address2 || null,
				city: venue.city || null,
				state: venue.state || null,
				postal_code: venue.postal_code || null,
				country: venue.country || null,
				currency_symbol: venue.currency_symbol || null,
				currency_locale: venue.currency_locale || null,
				timezone: venue.timezone || null,
				timezone_info: timezoneInfo,
				img_src: venue.img_src || null,
				description: venue.description || null,
				status: venue.status || "active",
			};

			let error;
			if (id === "new") {
				({ error } = await supabase.from("venues").insert(payload));
			} else {
				({ error } = await supabase.from("venues").update(payload).eq("id", id));
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
			const message = error instanceof Error ? error.message : "Unknown error occurred";
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

	const handleTimezoneChange = (value: string) => {
		setVenue((prev) => ({
			...prev,
			timezone: value,
			timezone_info: value
				? {
						id: "Pacific Standard Time",
						displayName: value,
						baseUtcOffset: "-08:00:00",
						currentUtcOffset: "-08:00:00",
					}
				: null,
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
						{id === "new" ? "Create Venue" : "Edit Venue"}
					</h1>
					<p className="text-muted-foreground">
						{id === "new" ? "Add a new venue to your listings" : "Update venue information"}
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
						{/* Name (English) */}
						<div className="space-y-2">
							<Label htmlFor="name">
								Name (English) <span className="text-destructive">*</span>
							</Label>
							<div className="flex gap-2">
								<Input
									id="name"
									value={venue.name}
									onChange={(e) => setVenue({ ...venue, name: e.target.value })}
									required
									disabled={loading}
									placeholder="Modern Showrooms at Alexis Park Resort Hotel"
									className="flex-1"
								/>
								<div className="flex items-center rounded-md border border-input bg-muted px-3 text-sm">
									EN
								</div>
							</div>
						</div>

						{/* External Venue ID */}
						<div className="space-y-2">
							<Label htmlFor="external_venue_id">External Venue ID</Label>
							<Input
								id="external_venue_id"
								value={venue.external_venue_id}
								onChange={(e) => setVenue({ ...venue, external_venue_id: e.target.value })}
								disabled={loading}
								placeholder="External Venue ID"
							/>
						</div>

						{/* Currency Locale */}
						<div className="space-y-2">
							<Label htmlFor="currency_locale">
								Currency Locale <span className="text-destructive">*</span>
							</Label>
							<Select
								value={venue.currency_locale}
								onValueChange={(value) =>
									setVenue({
										...venue,
										currency_locale: value,
										currency_symbol: getCurrencySymbol(value),
									})
								}
								required
								disabled={loading}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select currency locale" />
								</SelectTrigger>
								<SelectContent>
									{CURRENCY_LOCALES.map((locale) => (
										<SelectItem key={locale.value} value={locale.value}>
											{locale.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Street Address */}
						<div className="space-y-2">
							<Label htmlFor="address1">
								Street Address <span className="text-destructive">*</span>
							</Label>
							<Input
								id="address1"
								value={venue.address1}
								onChange={(e) => setVenue({ ...venue, address1: e.target.value })}
								required
								disabled={loading}
								placeholder="375 E Harmon"
							/>
						</div>

						{/* Street Address 2 */}
						<div className="space-y-2">
							<Label htmlFor="address2">Street Address 2</Label>
							<Input
								id="address2"
								value={venue.address2}
								onChange={(e) => setVenue({ ...venue, address2: e.target.value })}
								disabled={loading}
								placeholder="Street Address 2"
							/>
						</div>

						{/* City */}
						<div className="space-y-2">
							<Label htmlFor="city">
								City <span className="text-destructive">*</span>
							</Label>
							<Input
								id="city"
								value={venue.city}
								onChange={(e) => setVenue({ ...venue, city: e.target.value })}
								required
								disabled={loading}
								placeholder="Las Vegas"
							/>
						</div>

						{/* State/Province */}
						<div className="space-y-2">
							<Label htmlFor="state">
								State/Province <span className="text-destructive">*</span>
							</Label>
							<Input
								id="state"
								value={venue.state}
								onChange={(e) => setVenue({ ...venue, state: e.target.value })}
								required
								disabled={loading}
								placeholder="NV"
							/>
						</div>

						{/* Postal Code */}
						<div className="space-y-2">
							<Label htmlFor="postal_code">
								Postal Code <span className="text-destructive">*</span>
							</Label>
							<Input
								id="postal_code"
								value={venue.postal_code}
								onChange={(e) => setVenue({ ...venue, postal_code: e.target.value })}
								required
								disabled={loading}
								placeholder="89169"
							/>
						</div>

						{/* Country */}
						<div className="space-y-2">
							<Label htmlFor="country">
								Country <span className="text-destructive">*</span>
							</Label>
							<Select
								value={venue.country}
								onValueChange={(value) => setVenue({ ...venue, country: value })}
								required
								disabled={loading}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select Country" />
								</SelectTrigger>
								<SelectContent>
									{COUNTRIES.map((country) => (
										<SelectItem key={country} value={country}>
											{country}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Timezone */}
						<div className="space-y-2">
							<Label htmlFor="timezone">
								Timezone <span className="text-destructive">*</span>
							</Label>
							<Select
								value={venue.timezone}
								onValueChange={handleTimezoneChange}
								required
								disabled={loading}
							>
								<SelectTrigger>
									<SelectValue placeholder="Timezone" />
								</SelectTrigger>
								<SelectContent>
									{TIMEZONES.map((tz) => (
										<SelectItem key={tz} value={tz}>
											{tz}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Image Upload - Keep same as before */}
						<div className="space-y-2">
							<Label htmlFor="img_src">Image</Label>
							<div className="flex items-center gap-4">
								{venue.img_src && (
									<div className="relative h-20 w-32 overflow-hidden rounded-md border bg-muted">
										<Image
											src={venue.img_src}
											alt={venue.name || "Venue image"}
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
								onChange={(e) => setVenue({ ...venue, img_src: e.target.value })}
								disabled={loading}
								placeholder="https://ticketkite-images.s3.eu-west-2.amazonaws.com/venues/image.jpg"
							/>
							<p className="text-xs text-muted-foreground">
								Click &quot;Select Image&quot; to browse S3 bucket images or upload a new one
							</p>
						</div>

						{/* Description */}
						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<textarea
								id="description"
								value={venue.description}
								onChange={(e) => setVenue({ ...venue, description: e.target.value })}
								disabled={loading}
								rows={6}
								className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
								placeholder="Venue description..."
							/>
						</div>

						{/* Status */}
						<div className="space-y-2">
							<Label htmlFor="status">Status</Label>
							<select
								id="status"
								value={venue.status}
								onChange={(e) => setVenue({ ...venue, status: e.target.value })}
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
								{id === "new" ? "Create" : "Save Changes"}
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
