"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

export default function EditTagPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isNew = id === "new";
  const [loading, setLoading] = useState(false);
  const [tag, setTag] = useState({
    term_id: "",
    name: "",
    status: "active",
  });

  const loadTag = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tags")
        .select("id, term_id, name, status")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error loading tag:", error);
        toast.error("Failed to load tag from database: " + error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setLoading(false);
        return;
      }

      setTag({
        term_id: data.term_id ? String(data.term_id) : "",
        name: data.name ?? "",
        status: data.status ?? "active",
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Failed to load tag");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!isNew) {
      void loadTag();
    }
  }, [isNew, loadTag]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        term_id: tag.term_id ? parseInt(tag.term_id) : null,
        name: tag.name,
        status: tag.status || "active",
      };

      let error;
      if (isNew) {
        const { error: insertError } = await supabase
          .from("tags")
          .insert(payload)
          .select()
          .single();
        error = insertError;
        if (!error) {
          toast.success("Tag created successfully!");
          setTimeout(() => {
            router.push("/dashboard/tags");
          }, 1500);
          return;
        }
      } else {
        ({ error } = await supabase
          .from("tags")
          .update(payload)
          .eq("id", id));
      }

      if (error) {
        console.error("Error saving tag:", error);
        toast.error("Error saving tag: " + error.message);
      } else {
        toast.success(isNew ? "Tag created successfully!" : "Tag updated successfully!");
        setTimeout(() => {
          router.push("/dashboard/tags");
        }, 1500);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error("Error saving tag: " + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/tags">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isNew ? "Create New Tag" : "Edit Tag"}
          </h1>
          <p className="text-muted-foreground">
            {isNew
              ? "Add a new tag to your listings"
              : "Update tag information"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Tag Information</CardTitle>
            <CardDescription>Enter tag details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="term_id">Term ID (Optional)</Label>
              <Input
                id="term_id"
                type="number"
                value={tag.term_id}
                onChange={(e) =>
                  setTag({ ...tag, term_id: e.target.value })
                }
                disabled={loading}
                placeholder="618"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Original term ID from the system
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Tag Name *</Label>
              <Input
                id="name"
                value={tag.name}
                onChange={(e) =>
                  setTag({ ...tag, name: e.target.value })
                }
                required
                disabled={loading}
                placeholder="Disco"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={tag.status}
                onChange={(e) =>
                  setTag({ ...tag, status: e.target.value })
                }
                disabled={loading}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/tags")}
            disabled={loading}
          >
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
                {isNew ? "Create Tag" : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

