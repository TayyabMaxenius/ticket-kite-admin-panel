"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Upload, Loader2, CheckCircle2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BaseModal } from "./BaseModal";
import { toast } from "@/lib/toast";

interface MediaSelectModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelect: (mediaUrl: string) => void;
	currentMediaUrl?: string;
	mediaType: "image" | "video" | "all"; // 'image', 'video', or 'all' to show both
	uploadPrefix?: string; // Prefix for uploads (default: 'shows/')
}

interface S3Media {
	key: string;
	url: string;
	name: string;
	size: number;
	lastModified: string;
	type: "image" | "video";
}

export function MediaSelectModal({
	isOpen,
	onClose,
	onSelect,
	currentMediaUrl,
	mediaType = "image",
	uploadPrefix = "shows/",
}: MediaSelectModalProps) {
	const [media, setMedia] = useState<S3Media[]>([]);
	const [loading, setLoading] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState<{
		total: number;
		completed: number;
		current?: string;
	} | null>(null);
	const [selectedMedia, setSelectedMedia] = useState<string | null>(currentMediaUrl || null);
	const [uploadFiles, setUploadFiles] = useState<File[]>([]);

	useEffect(() => {
		if (isOpen) {
			loadMedia();
			setSelectedMedia(currentMediaUrl || null);
		}
	}, [isOpen, currentMediaUrl, mediaType]);

	const loadMedia = async () => {
		setLoading(true);
		try {
			// Fetch all media from S3 (no prefix filter)
			const typeParam = mediaType === "all" ? "all" : mediaType;
			const response = await fetch(`/api/s3/images?type=${typeParam}`);
			const data = await response.json();

			if (response.ok) {
				setMedia(data.images || []);
			} else {
				console.error("Failed to load media:", data.error);
				toast.error("Failed to load media: " + (data.error || "Unknown error"));
			}
		} catch (error) {
			console.error("Error loading media:", error);
			toast.error("Error loading media");
		} finally {
			setLoading(false);
		}
	};

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files || []);
		if (files.length === 0) return;

		const maxSize = 100 * 1024 * 1024; // 100MB for videos, 10MB for images
		const validFiles: File[] = [];
		const errors: string[] = [];

		files.forEach((file) => {
			// Validate file type
			const isImage = file.type.startsWith("image/");
			const isVideo = file.type.startsWith("video/");

			if (!isImage && !isVideo) {
				errors.push(`${file.name}: Not a valid image or video file`);
				return;
			}

			// Check media type filter
			if (mediaType === "image" && !isImage) {
				errors.push(`${file.name}: Only images are allowed`);
				return;
			}
			if (mediaType === "video" && !isVideo) {
				errors.push(`${file.name}: Only videos are allowed`);
				return;
			}

			// Validate file size
			if (file.size > maxSize) {
				errors.push(`${file.name}: Size must be less than 100MB`);
				return;
			}

			validFiles.push(file);
		});

		if (errors.length > 0) {
			toast.error(errors.join("\n"));
		}

		if (validFiles.length > 0) {
			setUploadFiles(validFiles);
		}
	};

	const handleUpload = async () => {
		if (uploadFiles.length === 0) return;

		setUploading(true);
		setUploadProgress({ total: uploadFiles.length, completed: 0 });
		const uploadedUrls: string[] = [];

		try {
			for (let i = 0; i < uploadFiles.length; i++) {
				const file = uploadFiles[i];
				setUploadProgress({
					total: uploadFiles.length,
					completed: i,
					current: file.name,
				});

				const formData = new FormData();
				formData.append("file", file);
				formData.append("prefix", uploadPrefix);

				const response = await fetch("/api/s3/images", {
					method: "POST",
					body: formData,
				});

				const data = await response.json();

				if (response.ok && data.url) {
					uploadedUrls.push(data.url);
				} else {
					console.error(`Failed to upload ${file.name}:`, data.error);
					toast.error(`Failed to upload ${file.name}: ${data.error || "Unknown error"}`);
				}
			}

			setUploadProgress({
				total: uploadFiles.length,
				completed: uploadFiles.length,
			});

			// Reload media list to show newly uploaded media
			await loadMedia();

			// Select the last uploaded media (or first if only one)
			if (uploadedUrls.length > 0) {
				setSelectedMedia(uploadedUrls[uploadedUrls.length - 1]);
				toast.success(`Successfully uploaded ${uploadedUrls.length} file(s)`);
			}

			setUploadFiles([]);
			// Reset file input
			const fileInput = document.getElementById("upload-file") as HTMLInputElement;
			if (fileInput) fileInput.value = "";

			if (uploadedUrls.length < uploadFiles.length) {
				toast.warning(
					`Uploaded ${uploadedUrls.length} of ${uploadFiles.length} files. Some uploads may have failed.`
				);
			}
		} catch (error) {
			console.error("Error uploading media:", error);
			toast.error("Error uploading media");
		} finally {
			setUploading(false);
			setUploadProgress(null);
		}
	};

	const handleSelect = () => {
		if (selectedMedia) {
			onSelect(selectedMedia);
			onClose();
		}
	};

	const filteredMedia =
		mediaType === "all" ? media : media.filter((item) => item.type === mediaType);

	const footer = (
		<>
			<Button variant="outline" onClick={onClose} disabled={uploading}>
				Cancel
			</Button>
			<Button onClick={handleSelect} disabled={!selectedMedia || uploading}>
				Select {mediaType === "all" ? "Media" : mediaType === "image" ? "Image" : "Video"}
			</Button>
		</>
	);

	const title =
		mediaType === "all"
			? "Select Media from Gallery"
			: mediaType === "image"
				? "Select Image from Gallery"
				: "Select Video from Gallery";

	return (
		<BaseModal isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
			<div className="space-y-4">
				{/* Upload New Media Section */}
				<div className="border-b pb-4">
					<h3 className="text-sm font-medium mb-3">
						Upload New {mediaType === "all" ? "Media" : mediaType === "image" ? "Images" : "Videos"}
					</h3>
					<div className="space-y-2">
						<Input
							id="upload-file"
							type="file"
							accept={
								mediaType === "all"
									? "image/*,video/*"
									: mediaType === "image"
										? "image/*"
										: "video/*"
							}
							onChange={handleFileSelect}
							disabled={uploading}
							className="flex-1"
							multiple
						/>
						{uploadFiles.length > 0 && (
							<div className="text-xs text-muted-foreground">
								{uploadFiles.length} file(s) selected
							</div>
						)}
						{uploadProgress && (
							<div className="text-xs text-muted-foreground space-y-1">
								<div>
									Uploading {uploadProgress.completed} of {uploadProgress.total}...
								</div>
								{uploadProgress.current && (
									<div className="font-medium">{uploadProgress.current}</div>
								)}
								<div className="w-full bg-muted rounded-full h-2">
									<div
										className="bg-primary h-2 rounded-full transition-all"
										style={{
											width: `${(uploadProgress.completed / uploadProgress.total) * 100}%`,
										}}
									/>
								</div>
							</div>
						)}
						<Button
							onClick={handleUpload}
							disabled={uploadFiles.length === 0 || uploading}
							size="sm"
							className="w-full"
						>
							{uploading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Uploading...
								</>
							) : (
								<>
									<Upload className="mr-2 h-4 w-4" />
									Upload {uploadFiles.length > 0 ? `${uploadFiles.length} ` : ""}
									{mediaType === "all" ? "File" : mediaType === "image" ? "Image" : "Video"}
									{uploadFiles.length !== 1 ? "s" : ""}
								</>
							)}
						</Button>
					</div>
				</div>

				{/* Media Grid */}
				<div>
					<h3 className="text-sm font-medium mb-3">
						Select from All{" "}
						{mediaType === "all" ? "Media" : mediaType === "image" ? "Images" : "Videos"} in Gallery
					</h3>
					{loading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : filteredMedia.length === 0 ? (
						<div className="text-center py-8 text-sm text-muted-foreground">
							No {mediaType === "all" ? "media" : mediaType === "image" ? "images" : "videos"}{" "}
							found. Upload a file to get started.
						</div>
					) : (
						<div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
							{filteredMedia.map((item) => (
								<div
									key={item.key}
									onClick={() => setSelectedMedia(item.url)}
									className={`relative aspect-square cursor-pointer rounded-md border-2 overflow-hidden transition-all ${
										selectedMedia === item.url
											? "border-primary ring-2 ring-primary"
											: "border-border hover:border-primary/50"
									}`}
								>
									{item.type === "image" ? (
										<Image
											src={item.url}
											alt={item.name}
											fill
											className="object-cover"
											unoptimized
										/>
									) : (
										<div className="w-full h-full bg-muted flex items-center justify-center">
											<Play className="h-12 w-12 text-muted-foreground" />
										</div>
									)}
									{selectedMedia === item.url && (
										<div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
											<CheckCircle2 className="h-8 w-8 text-primary" />
										</div>
									)}
									{item.type === "video" && (
										<div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
											{item.name}
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</BaseModal>
	);
}
