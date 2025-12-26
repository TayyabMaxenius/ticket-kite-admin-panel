"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, MapPin, MoreVertical, Edit, Trash2, Loader2 } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

interface Venue {
	id: number;
	name: string | null;
	external_venue_id: string | null;
	address1: string | null;
	address2: string | null;
	city: string | null;
	state: string | null;
	postal_code: string | null;
	country: string | null;
	currency_symbol: string | null;
	currency_locale: string | null;
	timezone: string | null;
	timezone_info: unknown;
	img_src: string | null;
	description: string | null;
	venue_url: string | null;
	status: string | null;
}

export default function VenuesPage() {
	const [venues, setVenues] = useState<Venue[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		loadVenues();
	}, []);

	const loadVenues = async () => {
		try {
			setLoading(true);
			const { data, error } = await supabase
				.from("venues")
				.select("*")
				.order("created_at", { ascending: false });

			if (error) {
				console.error("Error loading venues:", error);
				toast.error("Failed to load venues: " + error.message);
				return;
			}

			setVenues(data || []);
		} catch (error) {
			console.error("Unexpected error:", error);
			toast.error("Failed to load venues");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (venueId: number, venueTitle: string) => {
		if (!confirm(`Are you sure you want to delete "${venueTitle}"?`)) {
			return;
		}

		try {
			const { error } = await supabase.from("venues").delete().eq("id", venueId);

			if (error) {
				console.error("Error deleting venue:", error);
				toast.error("Failed to delete venue: " + error.message);
				return;
			}

			// Reload venues after deletion
			await loadVenues();
			toast.success("Venue deleted successfully!");
		} catch (error) {
			console.error("Unexpected error:", error);
			toast.error("Failed to delete venue");
		}
	};

	const filteredVenues = venues.filter((venue) => {
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			return (
				venue.name?.toLowerCase().includes(query) ||
				venue.city?.toLowerCase().includes(query) ||
				venue.state?.toLowerCase().includes(query) ||
				venue.address1?.toLowerCase().includes(query) ||
				venue.description?.toLowerCase().includes(query)
			);
		}
		return true;
	});

	return (
		<div className="space-y-6 animate-fade-in">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Venues</h1>
					<p className="text-muted-foreground">Manage your venue listings</p>
				</div>
				<Button asChild>
					<Link href="/dashboard/venues/new">
						<Plus className="mr-2 h-4 w-4" />
						Add Venue
					</Link>
				</Button>
			</div>

			{/* Search */}
			<Card>
				<CardContent className="pt-6">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<input
							type="text"
							placeholder="Search venues by name, city, state, or address..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						/>
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
						<MapPin className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold mb-2">
							{searchQuery ? "No venues found" : "No venues yet"}
						</h3>
						<p className="text-muted-foreground text-center mb-4">
							{searchQuery
								? "Try adjusting your search query"
								: "Get started by adding your first venue"}
						</p>
						{!searchQuery && (
							<Button asChild>
								<Link href="/dashboard/venues/new">
									<Plus className="mr-2 h-4 w-4" />
									Add Venue
								</Link>
							</Button>
						)}
					</CardContent>
				</Card>
			)}

			{/* Venues Grid */}
			{!loading && filteredVenues.length > 0 && (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{filteredVenues.map((venue) => (
						<Card key={venue.id} className="overflow-hidden">
							{venue.img_src && (
								<div className="relative h-48 w-full overflow-hidden bg-muted">
									<Image
										src={venue.img_src}
										alt={venue.name || "Venue image"}
										fill
										className="object-cover"
										unoptimized
									/>
								</div>
							)}
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<CardTitle className="text-lg">{venue.name || "Unnamed Venue"}</CardTitle>
										{(venue.city || venue.state) && (
											<CardDescription className="mt-1">
												{[venue.city, venue.state].filter(Boolean).join(", ")}
											</CardDescription>
										)}
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon" className="h-8 w-8">
												<MoreVertical className="h-4 w-4" />
												<span className="sr-only">Open menu</span>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem asChild>
												<Link href={`/dashboard/venues/${venue.id}`}>
													<Edit className="mr-2 h-4 w-4" />
													Edit
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => handleDelete(venue.id, venue.name || "this venue")}
												className="text-destructive"
											>
												<Trash2 className="mr-2 h-4 w-4" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</CardHeader>
							{venue.description && (
								<CardContent>
									<p className="text-sm text-muted-foreground line-clamp-3">{venue.description}</p>
								</CardContent>
							)}
							<CardContent className="pt-0">
								<div className="flex items-center gap-2">
									<span
										className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
											venue.status === "active"
												? "bg-green-100 text-green-800"
												: venue.status === "inactive"
													? "bg-red-100 text-red-800"
													: "bg-gray-100 text-gray-800"
										}`}
									>
										{venue.status || "active"}
									</span>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
