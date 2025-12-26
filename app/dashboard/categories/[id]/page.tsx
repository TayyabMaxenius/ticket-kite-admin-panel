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

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isNew = id === "new";
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState({
    term_id: "",
    name: "",
    status: "active",
  });

  const loadCategory = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, term_id, name, status")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error loading category:", error);
        toast.error("Failed to load category from database: " + error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setLoading(false);
        return;
      }

      setCategory({
        term_id: data.term_id ? String(data.term_id) : "",
        name: data.name ?? "",
        status: data.status ?? "active",
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Failed to load category");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!isNew) {
      void loadCategory();
    }
  }, [isNew, loadCategory]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        term_id: category.term_id ? parseInt(category.term_id) : null,
        name: category.name,
        status: category.status || "active",
      };

      let error;
      if (isNew) {
        const { error: insertError } = await supabase
          .from("categories")
          .insert(payload)
          .select()
          .single();
        error = insertError;
        if (!error) {
          toast.success("Category created successfully!");
          setTimeout(() => {
            router.push("/dashboard/categories");
          }, 1500);
          return;
        }
      } else {
        ({ error } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", id));
      }

      if (error) {
        console.error("Error saving category:", error);
        toast.error("Error saving category: " + error.message);
      } else {
        toast.success(isNew ? "Category created successfully!" : "Category updated successfully!");
        setTimeout(() => {
          router.push("/dashboard/categories");
        }, 1500);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error("Error saving category: " + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/categories">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isNew ? "Create New Category" : "Edit Category"}
          </h1>
          <p className="text-muted-foreground">
            {isNew
              ? "Add a new category to your listings"
              : "Update category information"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Category Information</CardTitle>
            <CardDescription>Enter category details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="term_id">Term ID (Optional)</Label>
              <Input
                id="term_id"
                type="number"
                value={category.term_id}
                onChange={(e) =>
                  setCategory({ ...category, term_id: e.target.value })
                }
                disabled={loading}
                placeholder="357"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Original term ID from the system
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                value={category.name}
                onChange={(e) =>
                  setCategory({ ...category, name: e.target.value })
                }
                required
                disabled={loading}
                placeholder="Alexis Park Resort"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={category.status}
                onChange={(e) =>
                  setCategory({ ...category, status: e.target.value })
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
            onClick={() => router.push("/dashboard/categories")}
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
                {isNew ? "Create Category" : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

