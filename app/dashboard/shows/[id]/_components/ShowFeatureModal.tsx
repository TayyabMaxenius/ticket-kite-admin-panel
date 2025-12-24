"use client";

import { useState } from "react";
import { BaseModal } from "./BaseModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ShowFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (feature: { title: string; description: string; img_url: string }) => void;
}

export function ShowFeatureModal({
  isOpen,
  onClose,
  onSave,
}: ShowFeatureModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imgUrl, setImgUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSave({
        title: title.trim(),
        description: description.trim(),
        img_url: imgUrl.trim(),
      });
      setTitle("");
      setDescription("");
      setImgUrl("");
      onClose();
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setImgUrl("");
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Show Feature"
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
          <Label htmlFor="feature-title">Feature Title *</Label>
          <Input
            id="feature-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Duration, The Hits, Age"
            required
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="feature-description">Description</Label>
          <Textarea
            id="feature-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., 65-70 Minutes, Get Ready to Sing Along to Elton John's Top Hits"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="feature-img-url">Image URL</Label>
          <Input
            id="feature-img-url"
            value={imgUrl}
            onChange={(e) => setImgUrl(e.target.value)}
            placeholder="https://ticketkite.com/wp-content/uploads/2024/01/noun-duration-2995228-FFFFFF.png"
            type="url"
          />
        </div>
      </form>
    </BaseModal>
  );
}

