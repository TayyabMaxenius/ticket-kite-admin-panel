"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import Image from "next/image";

interface ShowFeature {
	id: number;
	title: string;
	description: string | null;
	img_url: string | null;
	status: string | null;
}

export default function ShowFeaturesPage() {
	const [showFeatures, setShowFeatures] = useState<ShowFeature[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		loadShowFeatures();
	}, []);

	const loadShowFeatures = async () => {
		try {
			setLoading(true);
			const { data, error } = await supabase
				.from("show_features")
				.select("id, title, description, img_url, status")
				.order("title", { ascending: true });

			if (error) {
				console.error("Error loading show features:", error);
				toast.error("Failed to load show features: " + error.message);
				return;
			}

			setShowFeatures(data || []);
		} catch (error) {
			console.error("Unexpected error:", error);
			toast.error("Failed to load show features");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (featureId: number, featureTitle: string) => {
		if (!confirm(`Are you sure you want to delete "${featureTitle}"?`)) {
			return;
		}

		try {
			const { error } = await supabase.from("show_features").delete().eq("id", featureId);

			if (error) {
				console.error("Error deleting show feature:", error);
				toast.error("Failed to delete show feature: " + error.message);
				return;
			}

			toast.success("Show feature deleted successfully");
			loadShowFeatures();
		} catch (error) {
			console.error("Unexpected error:", error);
			toast.error("Failed to delete show feature");
		}
	};

	const filteredShowFeatures = showFeatures.filter(
		(feature) =>
			feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(feature.description && feature.description.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Show Features</h1>
					<p className="text-muted-foreground">Manage show feature details</p>
				</div>
				<Button asChild>
					<Link href="/dashboard/show-features/new">
						<Plus className="mr-2 h-4 w-4" />
						Add Show Feature
					</Link>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All Show Features</CardTitle>
					<CardDescription>Search and manage your show features</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="mb-4">
						<div className="relative">
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search show features..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-8"
							/>
						</div>
					</div>

					{loading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : filteredShowFeatures.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							{searchQuery
								? "No show features found matching your search."
								: "No show features yet. Create one to get started."}
						</div>
					) : (
						<div className="space-y-2">
							{filteredShowFeatures.map((feature) => (
								<div
									key={feature.id}
									className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
								>
									<div className="flex items-center gap-4 flex-1">
										{feature.img_url && (
											<div className="relative h-16 w-16 overflow-hidden rounded-md border bg-muted flex-shrink-0">
												<Image
													src={feature.img_url}
													alt={feature.title}
													fill
													className="object-cover"
													unoptimized
												/>
											</div>
										)}
										<div className="flex-1">
											<div className="font-medium">{feature.title}</div>
											{feature.description && (
												<div className="text-sm text-muted-foreground mt-1">
													{feature.description}
												</div>
											)}
											<div className="text-xs text-muted-foreground mt-1">
												Status: {feature.status || "active"}
											</div>
										</div>
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon">
												<span className="sr-only">Open menu</span>
												<Edit className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem asChild>
												<Link href={`/dashboard/show-features/${feature.id}`}>
													<Edit className="mr-2 h-4 w-4" />
													Edit
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => handleDelete(feature.id, feature.title)}
												className="text-destructive"
											>
												<Trash2 className="mr-2 h-4 w-4" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
