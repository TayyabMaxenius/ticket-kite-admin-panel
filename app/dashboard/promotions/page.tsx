"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

interface Promotion {
  id: number;
  promotion_id: number | null;
  name: string;
  code: string;
  require_even_number_of_tickets: boolean;
  status: string | null;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("promotions")
        .select("id, promotion_id, name, code, require_even_number_of_tickets, status")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error loading promotions:", error);
        toast.error("Failed to load promotions: " + error.message);
        return;
      }

      setPromotions(data || []);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Failed to load promotions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (promotionId: number, promotionName: string) => {
    if (!confirm(`Are you sure you want to delete "${promotionName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("promotions")
        .delete()
        .eq("id", promotionId);

      if (error) {
        console.error("Error deleting promotion:", error);
        toast.error("Failed to delete promotion: " + error.message);
        return;
      }

      toast.success("Promotion deleted successfully");
      loadPromotions();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Failed to delete promotion");
    }
  };

  const filteredPromotions = promotions.filter((promotion) =>
    promotion.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    promotion.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (promotion.promotion_id && promotion.promotion_id.toString().includes(searchQuery))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promotions</h1>
          <p className="text-muted-foreground">
            Manage show promotions
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/promotions/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Promotion
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Promotions</CardTitle>
          <CardDescription>
            Search and manage your show promotions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search promotions by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredPromotions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No promotions found matching your search." : "No promotions yet. Create one to get started."}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPromotions.map((promotion) => (
                <div
                  key={promotion.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <div className="font-medium">{promotion.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Code: {promotion.code} | Promotion ID: {promotion.promotion_id || "N/A"} | Status: {promotion.status || "active"}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <span className="sr-only">Open menu</span>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/promotions/${promotion.id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(promotion.id, promotion.name)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

