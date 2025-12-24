"use client";

import { useState } from "react";
import { BaseModal } from "./BaseModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface VenueDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (detail: {
    title: string;
    description: string;
    link_url: string;
    img_url: string;
  }) => void;
}

export function VenueDetailModal({
  isOpen,
  onClose,
  onSave,
}: VenueDetailModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imgUrl, setImgUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSave({
        title: title.trim(),
        description: description.trim(),
        link_url: linkUrl.trim() || "#",
        img_url: imgUrl.trim(),
      });
      setTitle("");
      setDescription("");
      setLinkUrl("");
      setImgUrl("");
      onClose();
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setLinkUrl("");
    setImgUrl("");
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Venue Detail"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            Add
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="venue-detail-title">Title *</Label>
          <Input
            id="venue-detail-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Free Parking, ADA Seating, Steakhouse at Alexis Garden"
            required
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="venue-detail-description">Description</Label>
          <Textarea
            id="venue-detail-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Free Parking is located throughout the Alexis Park Resort property."
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="venue-detail-link">Link URL</Label>
          <Input
            id="venue-detail-link"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="e.g., #, javascript:void(0), www.alexispark.com/dining/pegasus-bar"
            type="url"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="venue-detail-img-url">Image URL</Label>
          <Input
            id="venue-detail-img-url"
            value={imgUrl}
            onChange={(e) => setImgUrl(e.target.value)}
            placeholder="https://ticketkite.com/wp-content/uploads/2023/12/parking-sign.png"
            type="url"
          />
        </div>
      </form>
    </BaseModal>
  );
}

