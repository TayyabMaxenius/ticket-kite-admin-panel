"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Loader2, ImageIcon } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import Image from "next/image";
import { ImageSelectModal } from "@/app/dashboard/shows/[id]/_components/ImageSelectModal";

export default function EditShowFeaturePage() {
	const router = useRouter();
	const params = useParams();
	const id = params?.id as string;
	const isNew = id === "new";
	const [loading, setLoading] = useState(false);
	const [imageModalOpen, setImageModalOpen] = useState(false);
	const [showFeature, setShowFeature] = useState({
		title: "",
		description: "",
		img_url: "",
		status: "active",
	});

	const loadShowFeature = useCallback(async () => {
		setLoading(true);
		try {
			const { data, error } = await supabase
				.from("show_features")
				.select("id, title, description, img_url, status")
				.eq("id", id)
				.maybeSingle();

			if (error) {
				console.error("Error loading show feature:", error);
				toast.error("Failed to load show feature from database: " + error.message);
				setLoading(false);
				return;
			}

			if (!data) {
				setLoading(false);
				return;
			}

			setShowFeature({
				title: data.title ?? "",
				description: data.description ?? "",
				img_url: data.img_url ?? "",
				status: data.status ?? "active",
			});
		} catch (error) {
			console.error("Unexpected error:", error);
			toast.error("Failed to load show feature");
		} finally {
			setLoading(false);
		}
	}, [id]);

	useEffect(() => {
		if (!isNew) {
			void loadShowFeature();
		}
	}, [isNew, loadShowFeature]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		try {
			const payload = {
				title: showFeature.title,
				description: showFeature.description || null,
				img_url: showFeature.img_url || null,
				status: showFeature.status || "active",
			};

			let error;
			if (isNew) {
				const { error: insertError } = await supabase
					.from("show_features")
					.insert(payload)
					.select()
					.single();
				error = insertError;
				if (!error) {
					toast.success("Show feature created successfully!");
					setTimeout(() => {
						router.push("/dashboard/show-features");
					}, 1500);
					return;
				}
			} else {
				({ error } = await supabase.from("show_features").update(payload).eq("id", id));
			}

			if (error) {
				console.error("Error saving show feature:", error);
				toast.error("Error saving show feature: " + error.message);
			} else {
				toast.success(
					isNew ? "Show feature created successfully!" : "Show feature updated successfully!"
				);
				setTimeout(() => {
					router.push("/dashboard/show-features");
				}, 1500);
			}
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "Unknown error occurred";
			toast.error("Error saving show feature: " + message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-6 animate-fade-in">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" asChild>
					<Link href="/dashboard/show-features">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						{isNew ? "Create New Show Feature" : "Edit Show Feature"}
					</h1>
					<p className="text-muted-foreground">
						{isNew ? "Add a new show feature to your listings" : "Update show feature information"}
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit}>
				<Card>
					<CardHeader>
						<CardTitle>Show Feature Information</CardTitle>
						<CardDescription>Enter show feature details</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="title">Feature Title *</Label>
							<Input
								id="title"
								value={showFeature.title}
								onChange={(e) => setShowFeature({ ...showFeature, title: e.target.value })}
								required
								disabled={loading}
								placeholder="e.g., Duration, The Hits, Age"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={showFeature.description}
								onChange={(e) => setShowFeature({ ...showFeature, description: e.target.value })}
								disabled={loading}
								placeholder="e.g., 65-70 Minutes, Get Ready to Sing Along to Elton John's Top Hits"
								rows={3}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="img_url">Image URL</Label>
							<div className="flex items-center gap-4">
								{showFeature.img_url && (
									<div className="relative h-20 w-32 overflow-hidden rounded-md border bg-muted">
										<Image
											src={showFeature.img_url}
											alt="Feature image"
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
									{showFeature.img_url ? "Change Image" : "Select Image"}
								</Button>
							</div>
							<Input
								id="img_url"
								value={showFeature.img_url}
								onChange={(e) => setShowFeature({ ...showFeature, img_url: e.target.value })}
								placeholder="https://ticketkite.com/wp-content/uploads/2024/01/noun-duration-2995228-FFFFFF.png"
								type="url"
								disabled={loading}
							/>
							<p className="text-xs text-muted-foreground">
								Click &quot;Select Image&quot; to browse S3 bucket images or upload a new one
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="status">Status</Label>
							<select
								id="status"
								value={showFeature.status}
								onChange={(e) => setShowFeature({ ...showFeature, status: e.target.value })}
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
						onClick={() => router.push("/dashboard/show-features")}
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
								{isNew ? "Create Show Feature" : "Save Changes"}
							</>
						)}
					</Button>
				</div>
			</form>

			<ImageSelectModal
				isOpen={imageModalOpen}
				onClose={() => setImageModalOpen(false)}
				onSelect={(url) => setShowFeature({ ...showFeature, img_url: url })}
				currentImageUrl={showFeature.img_url}
			/>
		</div>
	);
}
