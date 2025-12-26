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

export default function EditPromotionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isNew = id === "new";
  const [loading, setLoading] = useState(false);
  const [promotion, setPromotion] = useState({
    promotion_id: "",
    name: "",
    code: "",
    require_even_number_of_tickets: false,
    status: "active",
  });

  const loadPromotion = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("promotions")
        .select("id, promotion_id, name, code, require_even_number_of_tickets, status")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error loading promotion:", error);
        setToast({ message: "Failed to load promotion from database: " + error.message, type: "error" });
        setLoading(false);
        return;
      }

      if (!data) {
        setLoading(false);
        return;
      }

      setPromotion({
        promotion_id: data.promotion_id ? String(data.promotion_id) : "",
        name: data.name ?? "",
        code: data.code ?? "",
        require_even_number_of_tickets: data.require_even_number_of_tickets ?? false,
        status: data.status ?? "active",
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      setToast({ message: "Failed to load promotion", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!isNew) {
      void loadPromotion();
    }
  }, [isNew, loadPromotion]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        promotion_id: promotion.promotion_id ? parseInt(promotion.promotion_id) : null,
        name: promotion.name,
        code: promotion.code,
        require_even_number_of_tickets: promotion.require_even_number_of_tickets,
        status: promotion.status || "active",
      };

      let error;
      if (isNew) {
        const { error: insertError } = await supabase
          .from("promotions")
          .insert(payload)
          .select()
          .single();
        error = insertError;
        if (!error) {
          toast.success("Promotion created successfully!");
          setTimeout(() => {
            router.push("/dashboard/promotions");
          }, 1500);
          return;
        }
      } else {
        ({ error } = await supabase
          .from("promotions")
          .update(payload)
          .eq("id", id));
      }

      if (error) {
        console.error("Error saving promotion:", error);
        toast.error("Error saving promotion: " + error.message);
      } else {
        toast.success(isNew ? "Promotion created successfully!" : "Promotion updated successfully!");
        setTimeout(() => {
          router.push("/dashboard/promotions");
        }, 1500);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error("Error saving promotion: " + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/promotions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isNew ? "Create New Promotion" : "Edit Promotion"}
          </h1>
          <p className="text-muted-foreground">
            {isNew
              ? "Add a new promotion to your listings"
              : "Update promotion information"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Promotion Information</CardTitle>
            <CardDescription>Enter promotion details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="promotion_id">Promotion ID (Optional)</Label>
              <Input
                id="promotion_id"
                type="number"
                value={promotion.promotion_id}
                onChange={(e) =>
                  setPromotion({ ...promotion, promotion_id: e.target.value })
                }
                disabled={loading}
                placeholder="100863"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Original promotion ID from the system
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Promotion Name *</Label>
              <Input
                id="name"
                value={promotion.name}
                onChange={(e) =>
                  setPromotion({ ...promotion, name: e.target.value })
                }
                required
                disabled={loading}
                placeholder="TicketKite"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Promotion Code *</Label>
              <Input
                id="code"
                value={promotion.code}
                onChange={(e) =>
                  setPromotion({ ...promotion, code: e.target.value.toUpperCase() })
                }
                required
                disabled={loading}
                placeholder="TICKETKITEVEGAS"
              />
              <p className="text-xs text-muted-foreground">
                Promotion code (will be converted to uppercase)
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="require_even_number_of_tickets"
                  checked={promotion.require_even_number_of_tickets}
                  onChange={(e) =>
                    setPromotion({ ...promotion, require_even_number_of_tickets: e.target.checked })
                  }
                  disabled={loading}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="require_even_number_of_tickets" className="cursor-pointer">
                  Require Even Number of Tickets
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={promotion.status}
                onChange={(e) =>
                  setPromotion({ ...promotion, status: e.target.value })
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
            onClick={() => router.push("/dashboard/promotions")}
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
                {isNew ? "Create Promotion" : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

