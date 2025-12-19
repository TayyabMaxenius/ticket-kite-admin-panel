import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          View detailed analytics and reports
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue & Performance</CardTitle>
          <CardDescription>Detailed analytics and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">
                Analytics charts will be implemented here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

