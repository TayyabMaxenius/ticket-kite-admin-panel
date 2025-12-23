import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2 } from "lucide-react";

export default function HotelsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hotels</h1>
          <p className="text-muted-foreground">
            Manage hotel partners, room-inclusive packages, and related offers.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Hotels Overview
          </CardTitle>
          <CardDescription>
            Placeholder page for hotel-related data, ready for Supabase
            integration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We can later show a grid of hotels, their venues, and linked shows
            here, and manage pricing, capacity, and availability.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
