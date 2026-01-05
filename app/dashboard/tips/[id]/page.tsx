"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2, ImageIcon, Check, X } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { ImageSelectModal } from "../_components/ImageSelectModal";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(
	() => import("@/components/ui/rich-text-editor").then((mod) => mod.RichTextEditor),
	{
		ssr: false,
		loading: () => (
			<div className="h-[300px] border rounded-md p-4 flex items-center justify-center text-muted-foreground">
				Loading editor...
			</div>
		),
	}
);

export default function EditTipPage() {
	const router = useRouter();
	const params = useParams();
	const id = params?.id as string;
	const isNew = id === "new";
	const [loading, setLoading] = useState(false);
	const [imageModalOpen, setImageModalOpen] = useState(false);
	const [availableCategories, setAvailableCategories] = useState<
		Array<{ id: number; term_id: number | null; name: string }>
	>([]);
	const [availableTags, setAvailableTags] = useState<
		Array<{ id: number; term_id: number | null; name: string }>
	>([]);
	const [categorySelectKey, setCategorySelectKey] = useState(0);
	const [tagSelectKey, setTagSelectKey] = useState(0);
	const [tip, setTip] = useState({
		post_id: "",
		title: "",
		img_src: "",
		post_slug: "",
		excerpt: "",
		content: "",
		categories: [] as Array<{ id?: number; term_id: number; name: string }>,
		tags: [] as Array<{ id?: number; term_id: number; name: string }>,
		// Yoast SEO fields
		yoast_focuskw: "",
		yoast_focuskeywords: "",
		yoast_metadesc: "",
		yoast_title: "",
	});

	const loadTip = useCallback(async () => {
		setLoading(true);
		try {
			const { data, error } = await supabase.from("tips").select("*").eq("id", id).maybeSingle();

			if (error) {
				console.error("Error loading tip:", error);
				toast.error("Failed to load tip from database: " + error.message);
				setLoading(false);
				return;
			}

			if (!data) {
				setLoading(false);
				return;
			}

			// Parse categories and tags (they might be JSONB arrays or JSON strings)
			let categories: Array<{ id?: number; term_id: number; name: string }> = [];
			let tags: Array<{ id?: number; term_id: number; name: string }> = [];

			if (data.categories) {
				if (typeof data.categories === "string") {
					try {
						categories = JSON.parse(data.categories);
					} catch {
						categories = Array.isArray(data.categories) ? data.categories : [];
					}
				} else if (Array.isArray(data.categories)) {
					categories = data.categories;
				}
			}

			if (data.tags) {
				if (typeof data.tags === "string") {
					try {
						tags = JSON.parse(data.tags);
					} catch {
						tags = Array.isArray(data.tags) ? data.tags : [];
					}
				} else if (Array.isArray(data.tags)) {
					tags = data.tags;
				}
			}

			// Parse yoast data (JSONB object)
			const yoastData = data.yoast || null;
			let yoast_focuskw = "";
			let yoast_focuskeywords = "";
			let yoast_metadesc = "";
			let yoast_title = "";

			if (yoastData) {
				if (typeof yoastData === "string") {
					try {
						const parsed = JSON.parse(yoastData);
						yoast_focuskw = parsed.yoast_wpseo_focuskw || "";
						yoast_focuskeywords = parsed.yoast_wpseo_focuskeywords || "";
						yoast_metadesc = parsed.yoast_wpseo_metadesc || "";
						yoast_title = parsed.yoast_wpseo_title || "";
					} catch {
						// If parsing fails, leave empty
					}
				} else if (typeof yoastData === "object") {
					yoast_focuskw =
						(yoastData as { yoast_wpseo_focuskw?: string })?.yoast_wpseo_focuskw || "";
					yoast_focuskeywords =
						(yoastData as { yoast_wpseo_focuskeywords?: string })?.yoast_wpseo_focuskeywords || "";
					yoast_metadesc =
						(yoastData as { yoast_wpseo_metadesc?: string })?.yoast_wpseo_metadesc || "";
					yoast_title = (yoastData as { yoast_wpseo_title?: string })?.yoast_wpseo_title || "";
				}
			}

			setTip({
				post_id: data.post_id ?? "",
				title: data.title ?? "",
				img_src: data.img_src ?? "",
				post_slug: data.post_slug ?? "",
				excerpt: data.excerpt ?? "",
				content: data.content ?? "",
				categories,
				tags,
				yoast_focuskw,
				yoast_focuskeywords,
				yoast_metadesc,
				yoast_title,
			});
		} catch (error) {
			console.error("Unexpected error:", error);
			toast.error("Failed to load tip");
		} finally {
			setLoading(false);
		}
	}, [id]);

	useEffect(() => {
		if (!isNew) {
			void loadTip();
		}
	}, [isNew, loadTip]);

	// Load categories for dropdown
	useEffect(() => {
		const loadCategories = async () => {
			try {
				const { data, error } = await supabase
					.from("categories")
					.select("id, term_id, name, status")
					.or("status.eq.active,status.is.null")
					.order("name", { ascending: true });

				if (error) {
					console.error("Error loading categories:", error);
					return;
				}

				setAvailableCategories(data || []);
			} catch (error) {
				console.error("Error loading categories:", error);
			}
		};

		void loadCategories();
	}, []);

	// Load tags for dropdown
	useEffect(() => {
		const loadTags = async () => {
			try {
				const { data, error } = await supabase
					.from("tags")
					.select("id, term_id, name, status")
					.or("status.eq.active,status.is.null")
					.order("name", { ascending: true });

				if (error) {
					console.error("Error loading tags:", error);
					return;
				}

				setAvailableTags(data || []);
			} catch (error) {
				console.error("Error loading tags:", error);
			}
		};

		void loadTags();
	}, []);

	const handleImageSelect = (imageUrl: string) => {
		setTip((prev) => ({ ...prev, img_src: imageUrl }));
		setImageModalOpen(false);
	};

	const handleAddCategory = (categoryId: string) => {
		const category = availableCategories.find((c) => c.id.toString() === categoryId);
		if (!category) return;

		// Check if already added
		if (tip.categories.some((c) => c.term_id === category.term_id)) {
			toast.error("Category already added");
			return;
		}

		setTip((prev) => ({
			...prev,
			categories: [
				...prev.categories,
				{ id: category.id, term_id: category.term_id || Date.now(), name: category.name },
			],
		}));
	};

	const removeCategory = (index: number) => {
		setTip((prev) => ({
			...prev,
			categories: prev.categories.filter((_, i) => i !== index),
		}));
	};

	const handleAddTag = (tagId: string) => {
		const tag = availableTags.find((t) => t.id.toString() === tagId);
		if (!tag) return;

		// Check if already added
		if (tip.tags.some((t) => t.term_id === tag.term_id)) {
			toast.error("Tag already added");
			return;
		}

		setTip((prev) => ({
			...prev,
			tags: [...prev.tags, { id: tag.id, term_id: tag.term_id || Date.now(), name: tag.name }],
		}));
	};

	const removeTag = (index: number) => {
		setTip((prev) => ({
			...prev,
			tags: prev.tags.filter((_, i) => i !== index),
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!tip.title.trim()) {
			toast.error("Title is required");
			return;
		}

		// Build yoast object
		const yoastObj: Record<string, unknown> = {};
		if (tip.yoast_focuskw) yoastObj.yoast_wpseo_focuskw = tip.yoast_focuskw;
		if (tip.yoast_focuskeywords) yoastObj.yoast_wpseo_focuskeywords = tip.yoast_focuskeywords;
		if (tip.yoast_metadesc) yoastObj.yoast_wpseo_metadesc = tip.yoast_metadesc;
		if (tip.yoast_title) yoastObj.yoast_wpseo_title = tip.yoast_title;

		setLoading(true);
		try {
			const tipData = {
				post_id: tip.post_id.trim() || null,
				title: tip.title.trim(),
				img_src: tip.img_src || null,
				post_slug: tip.post_slug || null,
				excerpt: tip.excerpt || null,
				content: tip.content || null,
				categories:
					tip.categories.length > 0
						? tip.categories.map((c) => ({ term_id: c.term_id, name: c.name }))
						: null,
				tags:
					tip.tags.length > 0 ? tip.tags.map((t) => ({ term_id: t.term_id, name: t.name })) : null,
				yoast: Object.keys(yoastObj).length > 0 ? yoastObj : null,
			};

			if (isNew) {
				const { error } = await supabase.from("tips").insert(tipData);

				if (error) {
					console.error("Error creating tip:", error);
					toast.error("Failed to create tip: " + error.message);
					setLoading(false);
					return;
				}

				toast.success("Tip created successfully!");
				router.push("/dashboard/tips");
			} else {
				const { error } = await supabase.from("tips").update(tipData).eq("id", id);

				if (error) {
					console.error("Error updating tip:", error);
					toast.error("Failed to update tip: " + error.message);
					setLoading(false);
					return;
				}

				toast.success("Tip updated successfully!");
				router.push("/dashboard/tips");
			}
		} catch (error) {
			console.error("Unexpected error:", error);
			toast.error("Failed to save tip");
			setLoading(false);
		}
	};

	return (
		<div className="space-y-6 animate-fade-in">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" asChild>
					<Link href="/dashboard/tips">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-3xl font-bold tracking-tight">{isNew ? "Create Tip" : "Edit Tip"}</h1>
					<p className="text-muted-foreground">
						{isNew ? "Add a new tip" : "Update tip information"}
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit}>
				<Card>
					<CardHeader>
						<CardTitle>Tip Information</CardTitle>
						<CardDescription>Enter tip details</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Post ID */}
						<div className="space-y-2">
							<Label htmlFor="post_id">Post ID</Label>
							<Input
								id="post_id"
								value={tip.post_id}
								onChange={(e) => setTip({ ...tip, post_id: e.target.value })}
								disabled={loading}
								placeholder="Post ID"
							/>
						</div>

						{/* Title */}
						<div className="space-y-2">
							<Label htmlFor="title">
								Title <span className="text-destructive">*</span>
							</Label>
							<Input
								id="title"
								value={tip.title}
								onChange={(e) => setTip({ ...tip, title: e.target.value })}
								required
								disabled={loading}
								placeholder="Tip title"
							/>
						</div>

						{/* Image */}
						<div className="space-y-2">
							<Label htmlFor="img_src">Image</Label>
							<div className="flex items-center gap-4">
								{tip.img_src && (
									<div className="relative h-20 w-32 overflow-hidden rounded-md border bg-muted">
										<Image
											src={tip.img_src}
											alt={tip.title || "Tip image"}
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
									{tip.img_src ? "Change Image" : "Select Image"}
								</Button>
							</div>
							<Input
								id="img_src"
								value={tip.img_src}
								onChange={(e) => setTip({ ...tip, img_src: e.target.value })}
								disabled={loading}
								placeholder="https://ticketkite.com/wp-content/uploads/2023/12/image.jpg"
							/>
							<p className="text-xs text-muted-foreground">
								Click &quot;Select Image&quot; to browse S3 bucket images or upload a new one
							</p>
						</div>

						{/* Post Slug */}
						<div className="space-y-2">
							<Label htmlFor="post_slug">Post Slug</Label>
							<Input
								id="post_slug"
								value={tip.post_slug}
								onChange={(e) => setTip({ ...tip, post_slug: e.target.value })}
								disabled={loading}
								placeholder="tip-slug-name"
							/>
							<p className="text-xs text-muted-foreground">
								URL-friendly slug for the tip (e.g., tip-slug-name)
							</p>
						</div>

						{/* Excerpt */}
						<div className="space-y-2">
							<Label htmlFor="excerpt">Excerpt</Label>
							<textarea
								id="excerpt"
								value={tip.excerpt}
								onChange={(e) => setTip({ ...tip, excerpt: e.target.value })}
								disabled={loading}
								placeholder="Tip excerpt or summary..."
								rows={4}
								className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
							/>
						</div>

						{/* Content */}
						<div className="space-y-2">
							<Label htmlFor="content">Content</Label>
							<RichTextEditor
								value={tip.content}
								onChange={(value) => setTip({ ...tip, content: value })}
								placeholder="Enter tip content... (supports HTML, CSS, and rich formatting)"
								disabled={loading}
							/>
							<p className="text-xs text-muted-foreground">
								Use the toolbar to format your content. HTML and CSS are supported.
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Categories & Tags */}
				<Card>
					<CardHeader>
						<CardTitle>Categories & Tags</CardTitle>
						<CardDescription>Add multiple categories and tags</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2 w-full">
							<Label>Categories</Label>
							<Select
								key={categorySelectKey}
								onValueChange={(value: string) => {
									if (value) {
										handleAddCategory(value);
										setCategorySelectKey((prev: number) => prev + 1);
									}
								}}
								disabled={loading}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select a category..." />
								</SelectTrigger>
								<SelectContent className="w-(--radix-select-trigger-width)">
									{availableCategories.map((category) => {
										const isSelected = tip.categories.some((c) => c.term_id === category.term_id);
										return (
											<SelectItem
												key={category.id}
												value={category.id.toString()}
												disabled={isSelected}
												className={isSelected ? "opacity-60" : ""}
											>
												<div className="flex items-center gap-2 w-full">
													{isSelected && <Check className="h-4 w-4 shrink-0" />}
													<span>{category.name}</span>
												</div>
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
							<div className="flex flex-wrap gap-2 mt-2">
								{tip.categories.map((cat, index) => (
									<div
										key={index}
										className="flex items-center gap-2 bg-muted px-3 py-1 rounded-md text-sm"
									>
										<span>{cat.name}</span>
										<button
											type="button"
											onClick={() => removeCategory(index)}
											className="text-destructive hover:text-destructive/80"
										>
											<X className="h-3 w-3" />
										</button>
									</div>
								))}
							</div>
						</div>

						<div className="space-y-2 w-full">
							<Label>Tags</Label>
							<Select
								key={tagSelectKey}
								onValueChange={(value: string) => {
									if (value) {
										handleAddTag(value);
										setTagSelectKey((prev: number) => prev + 1);
									}
								}}
								disabled={loading}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select a tag..." />
								</SelectTrigger>
								<SelectContent className="w-(--radix-select-trigger-width)">
									{availableTags.map((tag) => {
										const isSelected = tip.tags.some((t) => t.term_id === tag.term_id);
										return (
											<SelectItem
												key={tag.id}
												value={tag.id.toString()}
												disabled={isSelected}
												className={isSelected ? "opacity-60" : ""}
											>
												<div className="flex items-center gap-2 w-full">
													{isSelected && <Check className="h-4 w-4 shrink-0" />}
													<span>{tag.name}</span>
												</div>
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
							<div className="flex flex-wrap gap-2 mt-2">
								{tip.tags.map((tag, index) => (
									<div
										key={index}
										className="flex items-center gap-2 bg-muted px-3 py-1 rounded-md text-sm"
									>
										<span>{tag.name}</span>
										<button
											type="button"
											onClick={() => removeTag(index)}
											className="text-destructive hover:text-destructive/80"
										>
											<X className="h-3 w-3" />
										</button>
									</div>
								))}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Yoast SEO */}
				<Card>
					<CardHeader>
						<CardTitle>Yoast SEO</CardTitle>
						<CardDescription>Search engine optimization settings</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="yoast_focuskw">Focus Keyword</Label>
							<Input
								id="yoast_focuskw"
								value={tip.yoast_focuskw}
								onChange={(e) => setTip({ ...tip, yoast_focuskw: e.target.value })}
								placeholder="Focus keyword"
								disabled={loading}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="yoast_focuskeywords">Focus Keywords</Label>
							<Input
								id="yoast_focuskeywords"
								value={tip.yoast_focuskeywords}
								onChange={(e) => setTip({ ...tip, yoast_focuskeywords: e.target.value })}
								placeholder="Keyword1, Keyword2, Keyword3"
								disabled={loading}
							/>
							<p className="text-xs text-muted-foreground">Multiple keywords separated by commas</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="yoast_metadesc">Meta Description</Label>
							<textarea
								id="yoast_metadesc"
								value={tip.yoast_metadesc}
								onChange={(e) => setTip({ ...tip, yoast_metadesc: e.target.value })}
								placeholder="Meta description for search engines..."
								disabled={loading}
								rows={3}
								className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
							/>
							<p className="text-xs text-muted-foreground">
								Recommended length: 120-160 characters
							</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="yoast_title">SEO Title</Label>
							<Input
								id="yoast_title"
								value={tip.yoast_title}
								onChange={(e) => setTip({ ...tip, yoast_title: e.target.value })}
								placeholder="SEO title"
								disabled={loading}
							/>
							<p className="text-xs text-muted-foreground">Use title to insert the tip title</p>
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
				currentImageUrl={tip.img_src}
				uploadPrefix="tips/"
			/>
		</div>
	);
}
