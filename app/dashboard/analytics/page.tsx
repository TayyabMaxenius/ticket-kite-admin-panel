
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TimeRange = "6m" | "12m";

const monthlyDataAll = [
  { month: "Jan", revenue: 12000, tickets: 320 },
  { month: "Feb", revenue: 14500, tickets: 360 },
  { month: "Mar", revenue: 17100, tickets: 410 },
  { month: "Apr", revenue: 16000, tickets: 395 },
  { month: "May", revenue: 19000, tickets: 450 },
  { month: "Jun", revenue: 21000, tickets: 480 },
  { month: "Jul", revenue: 22000, tickets: 500 },
  { month: "Aug", revenue: 23000, tickets: 520 },
  { month: "Sep", revenue: 21500, tickets: 490 },
  { month: "Oct", revenue: 24000, tickets: 530 },
  { month: "Nov", revenue: 25500, tickets: 560 },
  { month: "Dec", revenue: 27000, tickets: 590 },
];

const monthlyDataByRange: Record<TimeRange, typeof monthlyDataAll> = {
  "6m": monthlyDataAll.slice(-6),
  "12m": monthlyDataAll,
};

const showPerformance = [
  { name: "Sir Elton", tickets: 520, revenueK: 23 },
  { name: "Sinatra Live", tickets: 410, revenueK: 18.5 },
  { name: "Motown Brunch", tickets: 380, revenueK: 16.5 },
  { name: "Comedy Night", tickets: 290, revenueK: 11.8 },
];

const showFilterOptions = ["All shows", ...showPerformance.map((s) => s.name)];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("6m");
  const [selectedShow, setSelectedShow] = useState<string>("All shows");

  const monthlyData = monthlyDataByRange[timeRange];
  const filteredShows =
    selectedShow === "All shows"
      ? showPerformance
      : showPerformance.filter((s) => s.name === selectedShow);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Revenue, ticket sales, and show performance
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="col-span-1 overflow-hidden">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 space-x-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Monthly Revenue
              </CardTitle>
              <CardDescription>
                Revenue and tickets sold over the selected period
              </CardDescription>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="mt-1 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="6m">Last 6 months</option>
              <option value="12m">Last 12 months</option>
            </select>
          </CardHeader>
          <CardContent className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue ($)"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="tickets"
                  name="Tickets sold"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 overflow-hidden">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 space-x-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Top Performing Shows
              </CardTitle>
              <CardDescription>
                Tickets sold and revenue per show (in thousands of dollars)
              </CardDescription>
            </div>
            <select
              value={selectedShow}
              onChange={(e) => setSelectedShow(e.target.value)}
              className="mt-1 max-w-[150px] rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {showFilterOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </CardHeader>
          <CardContent className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredShows}
                barCategoryGap={20}
                margin={{ top: 10, left: 0, right: 20, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-muted/60"
                  vertical={false}
                />
                <XAxis dataKey="name" tickLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="tickets"
                  name="Tickets"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  label={{ position: "top", fill: "#e5e7eb", fontSize: 10 }}
                />
                <Bar
                  dataKey="revenueK"
                  name="Revenue (k$)"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                  label={{ position: "top", fill: "#e5e7eb", fontSize: 10 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

