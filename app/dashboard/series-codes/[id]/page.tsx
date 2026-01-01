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

export default function EditSeriesCodePage() {
	const router = useRouter();
	const params = useParams();
	const id = params?.id as string;
	const isNew = id === "new";
	const [loading, setLoading] = useState(false);
	const [seriesCode, setSeriesCode] = useState({
		name: "",
		status: "active",
	});

	const loadSeriesCode = useCallback(async () => {
		setLoading(true);
		try {
			const { data, error } = await supabase
				.from("series_codes")
				.select("id, name, status")
				.eq("id", id)
				.maybeSingle();

			if (error) {
				console.error("Error loading series code:", error);
				toast.error("Failed to load series code from database: " + error.message);
				setLoading(false);
				return;
			}

			if (!data) {
				setLoading(false);
				return;
			}

			setSeriesCode({
				name: data.name ?? "",
				status: data.status ?? "active",
			});
		} catch (error) {
			console.error("Unexpected error:", error);
			toast.error("Failed to load series code");
		} finally {
			setLoading(false);
		}
	}, [id]);

	useEffect(() => {
		if (!isNew) {
			void loadSeriesCode();
		}
	}, [isNew, loadSeriesCode]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		try {
			// Check for duplicate name
			let duplicateQuery = supabase
				.from("series_codes")
				.select("id, name")
				.eq("name", seriesCode.name.trim())
				.limit(1);

			if (!isNew && id) {
				duplicateQuery = duplicateQuery.neq("id", id);
			}

			const { data: duplicateData } = await duplicateQuery;

			if (duplicateData && duplicateData.length > 0) {
				toast.error("A series code with this name already exists");
				setLoading(false);
				return;
			}

			const payload = {
				name: seriesCode.name.trim(),
				status: seriesCode.status || "active",
			};

			let error;
			if (isNew) {
				const { error: insertError } = await supabase
					.from("series_codes")
					.insert(payload)
					.select()
					.single();
				error = insertError;
				if (!error) {
					toast.success("Series code created successfully!");
					setTimeout(() => {
						router.push("/dashboard/series-codes");
					}, 1500);
					return;
				}
			} else {
				({ error } = await supabase.from("series_codes").update(payload).eq("id", id));
			}

			if (error) {
				console.error("Error saving series code:", error);
				if (error.code === "23505") {
					toast.error("A series code with this name already exists");
				} else {
					toast.error("Error saving series code: " + error.message);
				}
			} else {
				toast.success(
					isNew ? "Series code created successfully!" : "Series code updated successfully!"
				);
				setTimeout(() => {
					router.push("/dashboard/series-codes");
				}, 1500);
			}
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "Unknown error occurred";
			toast.error("Error saving series code: " + message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-6 animate-fade-in">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" asChild>
					<Link href="/dashboard/series-codes">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						{isNew ? "Create New Series Code" : "Edit Series Code"}
					</h1>
					<p className="text-muted-foreground">
						{isNew ? "Add a new series code to your listings" : "Update series code information"}
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit}>
				<Card>
					<CardHeader>
						<CardTitle>Series Code Information</CardTitle>
						<CardDescription>Enter series code details</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Name *</Label>
							<Input
								id="name"
								value={seriesCode.name}
								onChange={(e) => setSeriesCode({ ...seriesCode, name: e.target.value })}
								required
								disabled={loading}
								placeholder="Sir Elton"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="status">Status</Label>
							<select
								id="status"
								value={seriesCode.status}
								onChange={(e) => setSeriesCode({ ...seriesCode, status: e.target.value })}
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
						onClick={() => router.push("/dashboard/series-codes")}
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
								{isNew ? "Create Series Code" : "Save Changes"}
							</>
						)}
					</Button>
				</div>
			</form>
		</div>
	);
}
