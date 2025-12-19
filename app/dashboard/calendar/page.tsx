import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">
          View and manage show schedules
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Show Schedule</CardTitle>
          <CardDescription>Calendar view of all scheduled shows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[600px] items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">
                Calendar component will be implemented here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

