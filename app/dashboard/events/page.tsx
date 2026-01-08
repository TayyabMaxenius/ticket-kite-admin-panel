"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Plus, Search, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { format } from "date-fns";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface Event {
	id: number;
	show_id: number;
	name: string;
	description: string | null;
	event_date: string;
	event_end_date: string | null;
	status: string;
	promotions: Array<{ id: number; promotion_id: number; name: string; code: string }>;
	price_levels: Array<{
		id: number;
		price_level_id: number;
		name: string;
		label: string | null;
		availability?: number | null;
	}>;
	show_name?: string;
}

interface Show {
	id: number;
	name: string;
}

export default function EventsPage() {
	const [events, setEvents] = useState<Event[]>([]);
	const [shows, setShows] = useState<Show[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedShowId, setSelectedShowId] = useState<string>("all");

	useEffect(() => {
		loadShows();
		loadEvents();
	}, []);

	const loadShows = async () => {
		try {
			const { data, error } = await supabase.from("shows").select("id, title, data").order("title");

			if (error) {
				console.error("Error loading shows:", error);
				return;
			}

			if (data) {
				const transformedShows = data.map((show) => {
					const showData = (show.data as Record<string, unknown> | null) || {};
					const name =
						(show.title as string) ||
						(showData.title as string) ||
						(showData.name as string) ||
						"Untitled Show";
					return { id: show.id, name };
				});
				setShows(transformedShows);
			}
		} catch (error) {
			console.error("Error loading shows:", error);
		}
	};

	const loadEvents = async () => {
		try {
			setLoading(true);
			const { data, error } = await supabase
				.from("events")
				.select(
					`
					id,
					show_id,
					name,
					description,
					event_date,
					event_end_date,
					status,
					promotions,
					price_levels
				`
				)
				.order("event_date", { ascending: false });

			if (error) {
				console.error("Error loading events:", error);
				toast.error("Failed to load events: " + (error.message || "Unknown error"));
				return;
			}

			// Fetch show names separately
			const showIds = [...new Set((data || []).map((e) => e.show_id).filter(Boolean))];

			const showsMap = new Map<number, string>();

			// Fetch shows
			if (showIds.length > 0) {
				const { data: showsData } = await supabase
					.from("shows")
					.select("id, title, data")
					.in("id", showIds);

				if (showsData) {
					showsData.forEach((show) => {
						const showData = show.data as Record<string, unknown> | null;
						const name =
							show.title ||
							(showData?.name as string) ||
							(showData?.title as string) ||
							"Unknown Show";
						showsMap.set(show.id, name);
					});
				}
			}

			// Transform the data to include show names
			const transformedEvents = (data || []).map((event) => ({
				id: event.id,
				show_id: event.show_id,
				name: event.name,
				description: event.description,
				event_date: event.event_date,
				event_end_date: event.event_end_date,
				status: event.status,
				promotions: event.promotions || [],
				price_levels: event.price_levels || [],
				show_name: showsMap.get(event.show_id) || "Unknown Show",
			}));

			setEvents(transformedEvents);
		} catch (error) {
			console.error("Unexpected error:", error);
			toast.error("Failed to load events");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (eventId: number, eventName: string) => {
		if (!confirm(`Are you sure you want to delete "${eventName}"?`)) {
			return;
		}

		try {
			const { error } = await supabase.from("events").delete().eq("id", eventId);

			if (error) {
				console.error("Error deleting event:", error);
				toast.error("Failed to delete event: " + (error.message || "Unknown error"));
				return;
			}

			toast.success("Event deleted successfully");
			loadEvents();
		} catch (error) {
			console.error("Unexpected error:", error);
			toast.error("Failed to delete event");
		}
	};

	const filteredEvents = events.filter((event) => {
		// Filter by selected show
		if (selectedShowId !== "all" && event.show_id !== parseInt(selectedShowId)) {
			return false;
		}

		// Filter by search query
		return (
			event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			event.show_name?.toLowerCase().includes(searchQuery.toLowerCase())
		);
	});

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Events</h1>
					<p className="text-muted-foreground">Manage show events</p>
				</div>
				<Link href="/dashboard/events/new">
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						Add Event
					</Button>
				</Link>
			</div>

			<Card className="hover:scale-100">
				<CardHeader>
					<CardTitle>All Events</CardTitle>
					<CardDescription>Search and manage your events</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2 flex-1">
							<Search className="h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search events..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="max-w-sm"
							/>
						</div>
						<div className="flex items-center gap-2">
							<label htmlFor="show-filter" className="text-sm font-medium whitespace-nowrap">
								Filter by Show:
							</label>
							<Select value={selectedShowId} onValueChange={setSelectedShowId}>
								<SelectTrigger id="show-filter" className="w-[250px]">
									<SelectValue placeholder="Select a show" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Shows</SelectItem>
									{shows.map((show) => (
										<SelectItem key={show.id} value={show.id.toString()}>
											{show.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{loading ? (
						<div className="flex items-center justify-center py-8">
							<div className="text-muted-foreground">Loading events...</div>
						</div>
					) : filteredEvents.length === 0 ? (
						<div className="text-center py-8 text-sm text-muted-foreground">
							{searchQuery || selectedShowId !== "all"
								? "No events found matching your filters."
								: "No events yet. Create one to get started."}
						</div>
					) : (
						<div className="space-y-3">
							{filteredEvents.map((event) => (
								<div
									key={event.id}
									className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
								>
									<div className="flex-1">
										<div className="flex items-center gap-2">
											<h3 className="font-medium">{event.name}</h3>
										</div>
										<div className="text-sm text-muted-foreground mt-1">
											<div className="flex items-center gap-4">
												<span>Show: {event.show_name}</span>
												<span className="flex items-center gap-1">
													<Calendar className="h-3 w-3" />
													{format(new Date(event.event_date), "MMM dd, yyyy")}
												</span>
											</div>
											<div className="flex items-center gap-4 mt-1">
												{event.promotions.length > 0 && (
													<span>Promotions: {event.promotions.length}</span>
												)}
												{event.price_levels.length > 0 && (
													<span>
														Price Levels: {event.price_levels.length} (
														{event.price_levels.reduce(
															(sum, pl) => sum + (pl.availability || 0),
															0
														)}{" "}
														seats total)
													</span>
												)}
												<span>Status: {event.status}</span>
											</div>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Link href={`/dashboard/events/${event.id}`}>
											<Button variant="outline" size="sm">
												<Edit className="h-4 w-4" />
											</Button>
										</Link>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleDelete(event.id, event.name)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
