"use client";

import { useState } from "react";
import { BaseModal } from "./BaseModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

export function TagModal({ isOpen, onClose, onSave }: TagModalProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
      setName("");
      onClose();
    }
  };

  const handleClose = () => {
    setName("");
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Tag"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            Add
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tag-name">Tag Name</Label>
          <Input
            id="tag-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Elton John, Jeff Burkett, Sir Elton"
            autoFocus
          />
        </div>
      </form>
    </BaseModal>
  );
}

