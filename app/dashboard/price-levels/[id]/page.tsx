"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

export default function EditPriceLevelPage() {
	const router = useRouter();
	const params = useParams();
	const id = params?.id as string;
	const isNew = id === "new";
	const [loading, setLoading] = useState(false);
	const [priceLevel, setPriceLevel] = useState({
		price_level_id: "",
		name: "",
		label: "",
		description: "",
		status: "active",
	});

	const loadPriceLevel = useCallback(async () => {
		setLoading(true);
		try {
			const { data, error } = await supabase
				.from("price_levels")
				.select("id, price_level_id, name, label, description, status")
				.eq("id", id)
				.maybeSingle();

			if (error) {
				console.error("Error loading price level:", error);
				toast.error("Failed to load price level from database: " + error.message);
				setLoading(false);
				return;
			}

			if (!data) {
				setLoading(false);
				return;
			}

			setPriceLevel({
				price_level_id: data.price_level_id ? String(data.price_level_id) : "",
				name: data.name ?? "",
				label: data.label ?? "",
				description: data.description ?? "",
				status: data.status ?? "active",
			});
		} catch (error) {
			console.error("Unexpected error:", error);
			toast.error("Failed to load price level");
		} finally {
			setLoading(false);
		}
	}, [id]);

	useEffect(() => {
		if (!isNew) {
			void loadPriceLevel();
		}
	}, [isNew, loadPriceLevel]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		try {
			const payload = {
				price_level_id: priceLevel.price_level_id ? parseInt(priceLevel.price_level_id) : null,
				name: priceLevel.name,
				label: priceLevel.label || null,
				description: priceLevel.description || null,
				status: priceLevel.status || "active",
			};

			let error;
			if (isNew) {
				const { error: insertError } = await supabase
					.from("price_levels")
					.insert(payload)
					.select()
					.single();
				error = insertError;
				if (!error) {
					toast.success("Price level created successfully!");
					setTimeout(() => {
						router.push("/dashboard/price-levels");
					}, 1500);
					return;
				}
			} else {
				({ error } = await supabase.from("price_levels").update(payload).eq("id", id));
			}

			if (error) {
				console.error("Error saving price level:", error);
				toast.error("Error saving price level: " + error.message);
			} else {
				toast.success(
					isNew ? "Price level created successfully!" : "Price level updated successfully!"
				);
				setTimeout(() => {
					router.push("/dashboard/price-levels");
				}, 1500);
			}
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "Unknown error occurred";
			toast.error("Error saving price level: " + message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-6 animate-fade-in">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" asChild>
					<Link href="/dashboard/price-levels">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						{isNew ? "Create New Price Level" : "Edit Price Level"}
					</h1>
					<p className="text-muted-foreground">
						{isNew ? "Add a new price level to your listings" : "Update price level information"}
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit}>
				<Card>
					<CardHeader>
						<CardTitle>Price Level Information</CardTitle>
						<CardDescription>Enter price level details</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="price_level_id">Price Level ID (Optional)</Label>
							<Input
								id="price_level_id"
								type="number"
								value={priceLevel.price_level_id}
								onChange={(e) => setPriceLevel({ ...priceLevel, price_level_id: e.target.value })}
								disabled={loading}
								placeholder="86773"
							/>
							<p className="text-xs text-muted-foreground">
								Optional: Original price level ID from the system
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="name">Name *</Label>
							<Input
								id="name"
								value={priceLevel.name}
								onChange={(e) => setPriceLevel({ ...priceLevel, name: e.target.value })}
								required
								disabled={loading}
								placeholder="General Admission Seat"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="label">Label</Label>
							<Input
								id="label"
								value={priceLevel.label}
								onChange={(e) => setPriceLevel({ ...priceLevel, label: e.target.value })}
								disabled={loading}
								placeholder="GA Seat"
							/>
							<p className="text-xs text-muted-foreground">
								Optional: Short label for display purposes
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<textarea
								id="description"
								value={priceLevel.description}
								onChange={(e) => setPriceLevel({ ...priceLevel, description: e.target.value })}
								disabled={loading}
								rows={4}
								className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
								placeholder="Optional description for this price level"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="status">Status</Label>
							<select
								id="status"
								value={priceLevel.status}
								onChange={(e) => setPriceLevel({ ...priceLevel, status: e.target.value })}
								disabled={loading}
								className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
							>
								<option value="active">Active</option>
								<option value="inactive">Inactive</option>
							</select>
						</div>
					</CardContent>
				</Card>

				<div className="flex justify-end gap-4 mt-6">
					<Button
						type="button"
						variant="outline"
						onClick={() => router.push("/dashboard/price-levels")}
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
								{isNew ? "Create Price Level" : "Save Changes"}
							</>
						)}
					</Button>
				</div>
			</form>
		</div>
	);
}
