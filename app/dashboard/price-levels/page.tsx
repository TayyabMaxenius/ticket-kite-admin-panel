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

interface PriceLevel {
	id: number;
	price_level_id: number | null;
	name: string;
	label: string | null;
	description: string | null;
	status: string | null;
}

export default function PriceLevelsPage() {
	const [priceLevels, setPriceLevels] = useState<PriceLevel[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		loadPriceLevels();
	}, []);

	const loadPriceLevels = async () => {
		try {
			setLoading(true);
			const { data, error } = await supabase
				.from("price_levels")
				.select("id, price_level_id, name, label, description, status")
				.order("name", { ascending: true });

			if (error) {
				console.error("Error loading price levels:", error);
				toast.error("Failed to load price levels: " + error.message);
				return;
			}

			setPriceLevels(data || []);
		} catch (error) {
			console.error("Unexpected error:", error);
			toast.error("Failed to load price levels");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (priceLevelId: number, priceLevelName: string) => {
		if (!confirm(`Are you sure you want to delete "${priceLevelName}"?`)) {
			return;
		}

		try {
			const { error } = await supabase.from("price_levels").delete().eq("id", priceLevelId);

			if (error) {
				console.error("Error deleting price level:", error);
				toast.error("Failed to delete price level: " + error.message);
				return;
			}

			toast.success("Price level deleted successfully");
			loadPriceLevels();
		} catch (error) {
			console.error("Unexpected error:", error);
			toast.error("Failed to delete price level");
		}
	};

	const filteredPriceLevels = priceLevels.filter(
		(priceLevel) =>
			priceLevel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			priceLevel.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			priceLevel.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(priceLevel.price_level_id && priceLevel.price_level_id.toString().includes(searchQuery))
	);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Price Levels</h1>
					<p className="text-muted-foreground">Manage show price levels</p>
				</div>
				<Button asChild>
					<Link href="/dashboard/price-levels/new">
						<Plus className="mr-2 h-4 w-4" />
						Add Price Level
					</Link>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All Price Levels</CardTitle>
					<CardDescription>Search and manage your price levels</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="mb-4">
						<div className="relative">
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search price levels..."
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
					) : filteredPriceLevels.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							{searchQuery
								? "No price levels found matching your search."
								: "No price levels yet. Create one to get started."}
						</div>
					) : (
						<div className="space-y-2">
							{filteredPriceLevels.map((priceLevel) => (
								<div
									key={priceLevel.id}
									className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
								>
									<div className="flex-1">
										<div className="font-medium">{priceLevel.name}</div>
										<div className="text-sm text-muted-foreground">
											{priceLevel.label && `Label: ${priceLevel.label} | `}
											Price Level ID: {priceLevel.price_level_id || "N/A"} | Status:{" "}
											{priceLevel.status || "active"}
										</div>
										{priceLevel.description && (
											<div className="text-sm text-muted-foreground mt-1 line-clamp-2">
												{priceLevel.description}
											</div>
										)}
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
												<Link href={`/dashboard/price-levels/${priceLevel.id}`}>
													<Edit className="mr-2 h-4 w-4" />
													Edit
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => handleDelete(priceLevel.id, priceLevel.name)}
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
