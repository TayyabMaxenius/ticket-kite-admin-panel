"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BaseModal } from "./BaseModal";
import { toast } from "@/lib/toast";

interface ImageSelectModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelect: (imageUrl: string) => void;
	currentImageUrl?: string;
	uploadPrefix?: string; // Prefix for uploads (default: 'shows/')
}

interface S3Image {
	key: string;
	url: string;
	name: string;
	size: number;
	lastModified: string;
}

export function ImageSelectModal({
	isOpen,
	onClose,
	onSelect,
	currentImageUrl,
	uploadPrefix = "shows/",
}: ImageSelectModalProps) {
	const [images, setImages] = useState<S3Image[]>([]);
	const [loading, setLoading] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState<{
		total: number;
		completed: number;
		current?: string;
	} | null>(null);
	const [selectedImage, setSelectedImage] = useState<string | null>(currentImageUrl || null);
	const [uploadFiles, setUploadFiles] = useState<File[]>([]);

	useEffect(() => {
		if (isOpen) {
			loadImages();
			setSelectedImage(currentImageUrl || null);
		}
	}, [isOpen, currentImageUrl]);

	const loadImages = async () => {
		setLoading(true);
		try {
			// Fetch all images from S3 (no prefix filter)
			const response = await fetch("/api/s3/images");
			const data = await response.json();

			if (response.ok) {
				setImages(data.images || []);
			} else {
				console.error("Failed to load images:", data.error);
				toast.error("Failed to load images: " + (data.error || "Unknown error"));
			}
		} catch (error) {
			console.error("Error loading images:", error);
			toast.error("Error loading images");
		} finally {
			setLoading(false);
		}
	};

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files || []);
		if (files.length === 0) return;

		const maxSize = 10 * 1024 * 1024; // 10MB
		const validFiles: File[] = [];
		const errors: string[] = [];

		files.forEach((file) => {
			// Validate file type
			if (!file.type.startsWith("image/")) {
				errors.push(`${file.name}: Not a valid image file`);
				return;
			}

			// Validate file size
			if (file.size > maxSize) {
				errors.push(`${file.name}: Size must be less than 10MB`);
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

			// Reload images list to show newly uploaded images
			await loadImages();

			// Select the last uploaded image (or first if only one)
			if (uploadedUrls.length > 0) {
				setSelectedImage(uploadedUrls[uploadedUrls.length - 1]);
				toast.success(`Successfully uploaded ${uploadedUrls.length} image(s)`);
			}

			setUploadFiles([]);
			// Reset file input
			const fileInput = document.getElementById("upload-file") as HTMLInputElement;
			if (fileInput) fileInput.value = "";

			if (uploadedUrls.length < uploadFiles.length) {
				toast.warning(
					`Uploaded ${uploadedUrls.length} of ${uploadFiles.length} images. Some uploads may have failed.`
				);
			}
		} catch (error) {
			console.error("Error uploading images:", error);
			toast.error("Error uploading images");
		} finally {
			setUploading(false);
			setUploadProgress(null);
		}
	};

	const handleSelect = () => {
		if (selectedImage) {
			onSelect(selectedImage);
			onClose();
		}
	};

	const footer = (
		<>
			<Button variant="outline" onClick={onClose} disabled={uploading}>
				Cancel
			</Button>
			<Button onClick={handleSelect} disabled={!selectedImage || uploading}>
				Select Image
			</Button>
		</>
	);

	return (
		<BaseModal isOpen={isOpen} onClose={onClose} title="Select Image from Gallery" footer={footer}>
			<div className="space-y-4">
				{/* Upload New Image Section */}
				<div className="border-b pb-4">
					<h3 className="text-sm font-medium mb-3">Upload New Images</h3>
					<div className="space-y-2">
						<Input
							id="upload-file"
							type="file"
							accept="image/*"
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
									Image{uploadFiles.length !== 1 ? "s" : ""}
								</>
							)}
						</Button>
					</div>
				</div>

				{/* Images Grid */}
				<div>
					<h3 className="text-sm font-medium mb-3">Select from All Images in Gallery</h3>
					{loading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : images.length === 0 ? (
						<div className="text-center py-8 text-sm text-muted-foreground">
							No images found. Upload an image to get started.
						</div>
					) : (
						<div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
							{images.map((image) => (
								<div
									key={image.key}
									onClick={() => setSelectedImage(image.url)}
									className={`relative aspect-square cursor-pointer rounded-md border-2 overflow-hidden transition-all ${
										selectedImage === image.url
											? "border-primary ring-2 ring-primary"
											: "border-border hover:border-primary/50"
									}`}
								>
									<Image
										src={image.url}
										alt={image.name}
										fill
										className="object-cover"
										unoptimized
									/>
									{selectedImage === image.url && (
										<div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
											<CheckCircle2 className="h-8 w-8 text-primary" />
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
