"use client";

import { useState } from "react";
import Image from "next/image";
import { BaseModal } from "./BaseModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MediaSelectModal } from "./MediaSelectModal";
import { ImageIcon, Video } from "lucide-react";

interface GalleryMediaModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (url: string, type: "image" | "video") => void;
	onSaveMultiple?: (urls: string[], type: "image" | "video") => void; // For multiple selection
	type: "image" | "video";
	multiple?: boolean; // Enable multiple selection mode
}

export function GalleryMediaModal({
	isOpen,
	onClose,
	onSave,
	onSaveMultiple,
	type,
	multiple = false,
}: GalleryMediaModalProps) {
	const [url, setUrl] = useState("");
	const [mediaModalOpen, setMediaModalOpen] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (url.trim()) {
			onSave(url.trim(), type);
			setUrl("");
			onClose();
		}
	};

	const handleMultipleSelect = (urls: string[]) => {
		if (onSaveMultiple && urls.length > 0) {
			onSaveMultiple(urls, type);
			onClose();
		}
	};

	const handleClose = () => {
		setUrl("");
		onClose();
	};

	if (multiple) {
		return (
			<MediaSelectModal
				isOpen={isOpen}
				onClose={handleClose}
				onSelect={(mediaUrl) => {
					onSave(mediaUrl, type);
					handleClose();
				}}
				onSelectMultiple={handleMultipleSelect}
				currentMediaUrl={url}
				mediaType={type}
				uploadPrefix="shows/"
				multiple={true}
			/>
		);
	}

	return (
		<BaseModal
			isOpen={isOpen}
			onClose={handleClose}
			title={`Add ${type === "image" ? "Image" : "Video"} URL`}
			footer={
				<>
					<Button variant="outline" onClick={handleClose}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={!url.trim()}>
						Add
					</Button>
				</>
			}
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="media-url">{type === "image" ? "Image" : "Video"} URL *</Label>
					<div className="flex items-center gap-4">
						{url && type === "image" && (
							<div className="relative h-20 w-32 overflow-hidden rounded-md border bg-muted">
								<Image src={url} alt="Gallery image" fill className="object-cover" unoptimized />
							</div>
						)}
						{url && type === "video" && (
							<div className="relative h-20 w-32 overflow-hidden rounded-md border bg-muted flex items-center justify-center">
								<Video className="h-8 w-8 text-muted-foreground" />
							</div>
						)}
						<Button type="button" variant="outline" onClick={() => setMediaModalOpen(true)}>
							{type === "image" ? (
								<ImageIcon className="mr-2 h-4 w-4" />
							) : (
								<Video className="mr-2 h-4 w-4" />
							)}
							{url ? "Change" : "Select"} {type === "image" ? "Image" : "Video"}
						</Button>
					</div>
					<Input
						id="media-url"
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						placeholder={
							type === "image"
								? "https://ticketkite.com/wp-content/uploads/2025/05/332384259_511320637750763_7573778470119367884_n.jpg"
								: "Enter video URL"
						}
						type="url"
						required
						autoFocus
						className="mt-2"
					/>
					<p className="text-xs text-muted-foreground">
						Click &quot;Select {type === "image" ? "Image" : "Video"}&quot; to browse S3 bucket{" "}
						{type === "image" ? "images" : "videos"} or upload a new one
					</p>
				</div>
			</form>
			<MediaSelectModal
				isOpen={mediaModalOpen}
				onClose={() => setMediaModalOpen(false)}
				onSelect={(mediaUrl) => setUrl(mediaUrl)}
				onSelectMultiple={multiple ? handleMultipleSelect : undefined}
				currentMediaUrl={url}
				mediaType={type}
				uploadPrefix="shows/"
				multiple={multiple}
			/>
		</BaseModal>
	);
}
