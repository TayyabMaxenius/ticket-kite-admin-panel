import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Ticket } from "lucide-react";

export default function AttractionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attractions</h1>
          <p className="text-muted-foreground">
            Manage attractions, experiences, and non-theatre activities.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-primary" />
            Attractions Overview
          </CardTitle>
          <CardDescription>
            Placeholder page for attraction-type listings, ready to be wired to
            Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Later we can mirror the Shows grid here and filter by “attraction”
            category, with edit / delete actions and analytics specific to
            attractions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
