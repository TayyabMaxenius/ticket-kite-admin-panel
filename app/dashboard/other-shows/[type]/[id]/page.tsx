"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2, ImageIcon } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { ImageSelectModal } from "../../_components/ImageSelectModal";

type ShowType = "tours" | "attractions" | "hotels" | "live_shows";

const SHOW_TYPES: Record<ShowType, string> = {
	tours: "Tour",
	attractions: "Attraction",
	hotels: "Hotel",
	live_shows: "Live Show",
};

const UPLOAD_PREFIXES: Record<ShowType, string> = {
	tours: "tours/",
	attractions: "attractions/",
	hotels: "hotels/",
	live_shows: "live-shows/",
};

export default function EditOtherShowPage() {
	const router = useRouter();
	const params = useParams();
	const type = params?.type as ShowType;
	const id = params?.id as string;
	const isNew = id === "new";
	const [loading, setLoading] = useState(false);
	const [imageModalOpen, setImageModalOpen] = useState(false);
	const [show, setShow] = useState({
		name: "",
		img_src: "",
		show_url: "",
		redirect_url: "",
		status: "active",
	});

	// Validate type
	useEffect(() => {
		if (type && !["tours", "attractions", "hotels", "live_shows"].includes(type)) {
			toast.error("Invalid show type");
			router.push("/dashboard/other-shows");
		}
	}, [type, router]);

	const loadShow = useCallback(async () => {
		if (!type) return;

		setLoading(true);
		try {
			const { data, error } = await supabase.from(type).select("*").eq("id", id).maybeSingle();

			if (error) {
				console.error(`Error loading ${type}:`, error);
				toast.error(`Failed to load ${SHOW_TYPES[type] || type} from database: ${error.message}`);
				setLoading(false);
				return;
			}

			if (!data) {
				setLoading(false);
				return;
			}

			setShow({
				name: data.name ?? "",
				img_src: data.img_src ?? "",
				show_url: data.show_url ?? "",
				redirect_url: data.redirect_url ?? "",
				status: data.status ?? "active",
			});
		} catch (error) {
			console.error("Unexpected error:", error);
			toast.error("Failed to load show");
		} finally {
			setLoading(false);
		}
	}, [type, id]);

	useEffect(() => {
		if (!isNew && type) {
			void loadShow();
		}
	}, [isNew, type, loadShow]);

	const handleImageSelect = (imageUrl: string) => {
		setShow((prev) => ({ ...prev, img_src: imageUrl }));
		setImageModalOpen(false);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!type) {
			toast.error("Invalid show type");
			return;
		}

		if (!show.name.trim()) {
			toast.error("Name is required");
			return;
		}

		setLoading(true);
		try {
			if (isNew) {
				const { error } = await supabase.from(type).insert({
					name: show.name.trim(),
					img_src: show.img_src || null,
					show_url: show.show_url || null,
					redirect_url: show.redirect_url || null,
					status: show.status || "active",
				});

				if (error) {
					console.error(`Error creating ${type}:`, error);
					toast.error(`Failed to create ${SHOW_TYPES[type] || type}: ${error.message}`);
					setLoading(false);
					return;
				}

				toast.success(`${SHOW_TYPES[type] || type} created successfully!`);
				router.push("/dashboard/other-shows");
			} else {
				const { error } = await supabase
					.from(type)
					.update({
						name: show.name.trim(),
						img_src: show.img_src || null,
						show_url: show.show_url || null,
						redirect_url: show.redirect_url || null,
						status: show.status || "active",
					})
					.eq("id", id);

				if (error) {
					console.error(`Error updating ${type}:`, error);
					toast.error(`Failed to update ${SHOW_TYPES[type] || type}: ${error.message}`);
					setLoading(false);
					return;
				}

				toast.success(`${SHOW_TYPES[type] || type} updated successfully!`);
				router.push("/dashboard/other-shows");
			}
		} catch (error) {
			console.error("Unexpected error:", error);
			toast.error("Failed to save show");
			setLoading(false);
		}
	};

	if (!type || !["tours", "attractions", "hotels", "live_shows"].includes(type)) {
		return null;
	}

	const typeLabel = SHOW_TYPES[type] || type;

	return (
		<div className="space-y-6 animate-fade-in">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" asChild>
					<Link href="/dashboard/other-shows">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						{isNew ? `Create ${typeLabel}` : `Edit ${typeLabel}`}
					</h1>
					<p className="text-muted-foreground">
						{isNew
							? `Add a new ${typeLabel.toLowerCase()}`
							: `Update ${typeLabel.toLowerCase()} information`}
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit}>
				<Card>
					<CardHeader>
						<CardTitle>{typeLabel} Information</CardTitle>
						<CardDescription>Enter {typeLabel.toLowerCase()} details</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Name */}
						<div className="space-y-2">
							<Label htmlFor="name">
								Name <span className="text-destructive">*</span>
							</Label>
							<Input
								id="name"
								value={show.name}
								onChange={(e) => setShow({ ...show, name: e.target.value })}
								required
								disabled={loading}
								placeholder={`${typeLabel} name`}
							/>
						</div>

						{/* Image */}
						<div className="space-y-2">
							<Label htmlFor="img_src">Image</Label>
							<div className="flex items-center gap-4">
								{show.img_src && (
									<div className="relative h-20 w-32 overflow-hidden rounded-md border bg-muted">
										<img
											src={show.img_src}
											alt={show.name || `${typeLabel} image`}
											className="h-full w-full object-cover"
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
									{show.img_src ? "Change Image" : "Select Image"}
								</Button>
							</div>
							<Input
								id="img_src"
								value={show.img_src}
								onChange={(e) => setShow({ ...show, img_src: e.target.value })}
								disabled={loading}
								placeholder="https://ticketkite.com/wp-content/uploads/2023/12/image.jpg"
							/>
							<p className="text-xs text-muted-foreground">
								Click &quot;Select Image&quot; to browse S3 bucket images or upload a new one
							</p>
						</div>

						{/* Show URL */}
						<div className="space-y-2">
							<Label htmlFor="show_url">Show URL</Label>
							<Input
								id="show_url"
								value={show.show_url}
								onChange={(e) => setShow({ ...show, show_url: e.target.value })}
								disabled={loading}
								placeholder={`https://ticketkite.com/all-${type === "live_shows" ? "live-shows" : type}/...`}
								type="url"
							/>
						</div>

						{/* Redirect URL */}
						<div className="space-y-2">
							<Label htmlFor="redirect_url">Redirect URL</Label>
							<Input
								id="redirect_url"
								value={show.redirect_url}
								onChange={(e) => setShow({ ...show, redirect_url: e.target.value })}
								disabled={loading}
								placeholder="https://vegas.vdvm.net/c/..."
								type="url"
							/>
						</div>

						{/* Status */}
						<div className="space-y-2">
							<Label htmlFor="status">Status</Label>
							<select
								id="status"
								value={show.status}
								onChange={(e) => setShow({ ...show, status: e.target.value })}
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
								{isNew ? "Create" : "Save Changes"}
							</>
						)}
					</Button>
				</div>
			</form>

			<ImageSelectModal
				isOpen={imageModalOpen}
				onClose={() => setImageModalOpen(false)}
				onSelect={handleImageSelect}
				currentImageUrl={show.img_src}
				uploadPrefix={UPLOAD_PREFIXES[type]}
			/>
		</div>
	);
}
