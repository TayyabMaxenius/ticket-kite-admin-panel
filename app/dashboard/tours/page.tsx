import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Ticket } from "lucide-react";

export default function ToursPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tours</h1>
          <p className="text-muted-foreground">
            Manage sightseeing tours, day trips, and guided experiences.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-primary" />
            Tours Overview
          </CardTitle>
          <CardDescription>
            This is a placeholder page. We’ll connect it to Supabase data next.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Here you&apos;ll be able to see and manage all tour-type shows
            (city tours, bus tours, walking tours, etc.). We can reuse the same
            layout as the main Shows page, filtered by the “tour” category.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


