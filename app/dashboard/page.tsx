import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Ticket, DollarSign, Users, TrendingUp, Calendar, ShoppingCart } from "lucide-react"

const stats = [
  {
    title: "Total Shows",
    value: "127",
    description: "Active shows in the system",
    icon: Ticket,
    trend: "+12%",
  },
  {
    title: "Total Revenue",
    value: "$45,231",
    description: "From all bookings",
    icon: DollarSign,
    trend: "+20.1%",
  },
  {
    title: "Total Orders",
    value: "2,350",
    description: "Bookings this month",
    icon: ShoppingCart,
    trend: "+15%",
  },
  {
    title: "Active Customers",
    value: "1,429",
    description: "Registered users",
    icon: Users,
    trend: "+8%",
  },
]

const recentShows = [
  {
    id: 1,
    name: "Sir Elton - At the Piano",
    venue: "Modern Showrooms",
    date: "2025-12-19",
    ticketsSold: 45,
    revenue: "$2,025",
    status: "active",
  },
  {
    id: 2,
    name: "Barbra! Memories in Vegas",
    venue: "Alexis Park Resort",
    date: "2025-12-20",
    ticketsSold: 38,
    revenue: "$1,441",
    status: "active",
  },
  {
    id: 3,
    name: "Sinatra Live!",
    venue: "Modern Showrooms",
    date: "2025-12-21",
    ticketsSold: 52,
    revenue: "$2,337",
    status: "active",
  },
  {
    id: 4,
    name: "Motown Brunch",
    venue: "The Modern Showrooms",
    date: "2025-12-22",
    ticketsSold: 67,
    revenue: "$3,949",
    status: "active",
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your shows today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
                <div className="flex items-center pt-1">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">{stat.trend}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    from last month
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Shows Performance</CardTitle>
            <CardDescription>
              Shows scheduled for the upcoming week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentShows.map((show) => (
                <div
                  key={show.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {show.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {show.venue} • {show.date}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium">{show.revenue}</p>
                    <p className="text-xs text-muted-foreground">
                      {show.ticketsSold} tickets
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Next 5 scheduled shows</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentShows.slice(0, 5).map((show, index) => (
                <div key={show.id} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {show.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {show.date} • {show.venue}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

