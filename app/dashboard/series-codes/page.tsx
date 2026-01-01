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

interface SeriesCode {
	id: number;
	name: string;
	status: string | null;
}

export default function SeriesCodesPage() {
	const [seriesCodes, setSeriesCodes] = useState<SeriesCode[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		loadSeriesCodes();
	}, []);

	const loadSeriesCodes = async () => {
		try {
			setLoading(true);
			const { data, error } = await supabase
				.from("series_codes")
				.select("id, name, status")
				.order("name", { ascending: true });

			if (error) {
				console.error("Error loading series codes:", error);
				toast.error("Failed to load series codes: " + error.message);
				return;
			}

			setSeriesCodes(data || []);
		} catch (error) {
			console.error("Unexpected error:", error);
			toast.error("Failed to load series codes");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (seriesCodeId: number, seriesCodeName: string) => {
		if (!confirm(`Are you sure you want to delete "${seriesCodeName}"?`)) {
			return;
		}

		try {
			const { error } = await supabase.from("series_codes").delete().eq("id", seriesCodeId);

			if (error) {
				console.error("Error deleting series code:", error);
				toast.error("Failed to delete series code: " + error.message);
				return;
			}

			toast.success("Series code deleted successfully");
			loadSeriesCodes();
		} catch (error) {
			console.error("Unexpected error:", error);
			toast.error("Failed to delete series code");
		}
	};

	const filteredSeriesCodes = seriesCodes.filter((seriesCode) =>
		seriesCode.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Series Codes</h1>
					<p className="text-muted-foreground">Manage series codes for shows</p>
				</div>
				<Button asChild>
					<Link href="/dashboard/series-codes/new">
						<Plus className="mr-2 h-4 w-4" />
						Add Series Code
					</Link>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All Series Codes</CardTitle>
					<CardDescription>Search and manage your series codes</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="mb-4">
						<div className="relative">
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search series codes..."
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
					) : filteredSeriesCodes.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							{searchQuery
								? "No series codes found matching your search."
								: "No series codes yet. Create one to get started."}
						</div>
					) : (
						<div className="space-y-2">
							{filteredSeriesCodes.map((seriesCode) => (
								<div
									key={seriesCode.id}
									className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
								>
									<div>
										<div className="font-medium">{seriesCode.name}</div>
										<div className="text-xs text-muted-foreground mt-1">
											Status: {seriesCode.status || "active"}
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
												<Link href={`/dashboard/series-codes/${seriesCode.id}`}>
													<Edit className="mr-2 h-4 w-4" />
													Edit
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => handleDelete(seriesCode.id, seriesCode.name)}
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
