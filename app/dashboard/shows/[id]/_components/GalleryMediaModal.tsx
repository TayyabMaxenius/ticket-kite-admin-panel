"use client";

import { useState } from "react";
import { BaseModal } from "./BaseModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface GalleryMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string, type: "image" | "video") => void;
  type: "image" | "video";
}

export function GalleryMediaModal({
  isOpen,
  onClose,
  onSave,
  type,
}: GalleryMediaModalProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSave(url.trim(), type);
      setUrl("");
      onClose();
    }
  };

  const handleClose = () => {
    setUrl("");
    onClose();
  };

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
          <Label htmlFor="media-url">
            {type === "image" ? "Image" : "Video"} URL *
          </Label>
          <Input
            id="media-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={type === "image" 
              ? "https://ticketkite.com/wp-content/uploads/2025/05/332384259_511320637750763_7573778470119367884_n.jpg"
              : "Enter video URL"}
            type="url"
            required
            autoFocus
          />
        </div>
      </form>
    </BaseModal>
  );
}

