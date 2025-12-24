"use client";

import { useState } from "react";
import { BaseModal } from "./BaseModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CastMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: { title: string; description: string; img_url: string }) => void;
}

export function CastMemberModal({
  isOpen,
  onClose,
  onSave,
}: CastMemberModalProps) {
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
      title="Add Cast Member"
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
          <Label htmlFor="cast-name">Cast Member Name *</Label>
          <Input
            id="cast-name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Jeff Burkett"
            required
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cast-description">Description</Label>
          <Textarea
            id="cast-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional: Enter cast member description"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cast-img-url">Image URL</Label>
          <Input
            id="cast-img-url"
            value={imgUrl}
            onChange={(e) => setImgUrl(e.target.value)}
            placeholder="https://ticketkite.com/wp-content/uploads/2025/05/IMG_7873.jpeg"
            type="url"
          />
        </div>
      </form>
    </BaseModal>
  );
}

