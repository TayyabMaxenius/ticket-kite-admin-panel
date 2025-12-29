"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, MoreVertical, Edit, Trash2, Loader2 } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

type ShowType = "tours" | "attractions" | "hotels" | "live_shows";

interface Show {
	id: number;
	name: string;
	img_src: string | null;
	show_url: string | null;
	redirect_url: string | null;
	status: string | null;
	created_at: string;
	updated_at: string;
}

const SHOW_TYPES: { value: ShowType; label: string }[] = [
	{ value: "tours", label: "Tours" },
	{ value: "attractions", label: "Attractions" },
	{ value: "hotels", label: "Hotels" },
	{ value: "live_shows", label: "Live Shows" },
];

export default function OtherShowsPage() {
	const [shows, setShows] = useState<Show[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [showType, setShowType] = useState<ShowType>("tours");

	useEffect(() => {
		void loadShows();
	}, [showType]); // eslint-disable-line react-hooks/exhaustive-deps

	const loadShows = async () => {
		try {
			setLoading(true);
			const { data, error } = await supabase
				.from(showType)
				.select("*")
				.order("created_at", { ascending: false });

			if (error) {
				console.error(`Error loading ${showType}:`, error);
				toast.error(
					`Failed to load ${SHOW_TYPES.find((t) => t.value === showType)?.label || showType}: ${error.message || ""}`
				);
				return;
			}

			setShows(data || []);
		} catch (error) {
			console.error("Unexpected error:", error);
			toast.error("Failed to load shows");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (showId: number, showName: string) => {
		if (!confirm(`Are you sure you want to delete "${showName}"?`)) {
			return;
		}

		try {
			const { error } = await supabase.from(showType).delete().eq("id", showId);

			if (error) {
				console.error(`Error deleting ${showType}:`, error);
				toast.error(
					`Failed to delete ${SHOW_TYPES.find((t) => t.value === showType)?.label || showType}: ${error.message}`
				);
				return;
			}

			await loadShows();
			toast.success(
				`${SHOW_TYPES.find((t) => t.value === showType)?.label || showType} deleted successfully!`
			);
		} catch (error) {
			console.error("Unexpected error:", error);
			toast.error("Failed to delete show");
		}
	};

	const filteredShows = shows.filter((show) => {
		if (!searchQuery) return true;
		const query = searchQuery.toLowerCase();
		return show.name?.toLowerCase().includes(query);
	});

	const getStatusColor = (status: string | null) => {
		switch (status) {
			case "active":
				return "bg-green-500/10 text-green-500";
			case "inactive":
				return "bg-gray-500/10 text-gray-500";
			case "draft":
				return "bg-yellow-500/10 text-yellow-500";
			default:
				return "bg-gray-500/10 text-gray-500";
		}
	};

	const currentTypeLabel = SHOW_TYPES.find((t) => t.value === showType)?.label || showType;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Other Shows</h1>
					<p className="text-muted-foreground">
						Manage tours, attractions, hotels, and live shows.
					</p>
				</div>
				<Button asChild>
					<Link href={`/dashboard/other-shows/${showType}/new`}>
						<Plus className="mr-2 h-4 w-4" />
						Add New {currentTypeLabel.slice(0, -1)}
					</Link>
				</Button>
			</div>

			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle>Filters</CardTitle>
					<CardDescription>Select type and search shows</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4 md:flex-row md:items-center">
						<div className="flex items-center gap-2">
							<span className="text-sm text-muted-foreground min-w-[80px]">Show Type:</span>
							<Select value={showType} onValueChange={(value) => setShowType(value as ShowType)}>
								<SelectTrigger className="w-[200px]">
									<SelectValue placeholder="Select type" />
								</SelectTrigger>
								<SelectContent>
									{SHOW_TYPES.map((type) => (
										<SelectItem key={type.value} value={type.value}>
											{type.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<input
								type="text"
								placeholder={`Search ${currentTypeLabel.toLowerCase()} by name...`}
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

			{/* Empty State */}
			{!loading && filteredShows.length === 0 && (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<p className="mb-4 text-muted-foreground">
							{searchQuery
								? `No ${currentTypeLabel.toLowerCase()} found matching your search.`
								: `No ${currentTypeLabel.toLowerCase()} found. Add your first ${currentTypeLabel.slice(0, -1).toLowerCase()} to get started.`}
						</p>
						<Button asChild>
							<Link href={`/dashboard/other-shows/${showType}/new`}>
								<Plus className="mr-2 h-4 w-4" />
								Add New {currentTypeLabel.slice(0, -1)}
							</Link>
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Shows Grid */}
			{!loading && filteredShows.length > 0 && (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{filteredShows.map((show) => (
						<Card key={show.id} className="overflow-hidden group">
							<div className="aspect-video w-full bg-muted relative overflow-hidden">
								{show.img_src ? (
									<Image
										src={show.img_src}
										alt={show.name || "Show image"}
										fill
										className="object-cover group-hover:scale-105 transition-transform duration-300"
										unoptimized
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
										<span className="text-sm text-muted-foreground">No Image</span>
									</div>
								)}
							</div>
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="min-w-0 flex-1 space-y-1">
										<CardTitle className="truncate text-lg">
											{show.name || "Untitled Show"}
										</CardTitle>
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
												<MoreVertical className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem asChild>
												<Link
													href={`/dashboard/other-shows/${showType}/${show.id}`}
													className="flex items-center"
												>
													<Edit className="mr-2 h-4 w-4" />
													Edit
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem
												className="text-destructive"
												onClick={() => handleDelete(show.id, show.name || "this show")}
											>
												<Trash2 className="mr-2 h-4 w-4" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-2 text-sm">
									{show.show_url && (
										<div className="flex justify-between">
											<span className="text-muted-foreground">Show URL:</span>
											<span className="font-medium truncate ml-2">
												{show.show_url.length > 30
													? `${show.show_url.substring(0, 30)}...`
													: show.show_url}
											</span>
										</div>
									)}
									<div className="flex justify-between">
										<span className="text-muted-foreground">Status:</span>
										<span
											className={`rounded-full px-2 py-1 text-xs capitalize ${getStatusColor(
												show.status
											)}`}
										>
											{show.status || "active"}
										</span>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
