"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Search, MapPin, MoreVertical, Edit, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function VenuesPage() {
  const venues = [
    {
      id: 1,
      name: "Modern Showrooms at Alexis Park Resort",
      address: "375 E. Harmon Ave, Las Vegas, NV 89169",
      shows: 15,
      capacity: 300,
    },
    {
      id: 2,
      name: "Alexis Park & Resort",
      address: "375 E. Harmon Ave, Las Vegas, NV 89169",
      shows: 8,
      capacity: 250,
    },
    {
      id: 3,
      name: "Ahern Live Showroom",
      address: "300 E. Fremont St, Las Vegas, NV 89101",
      shows: 12,
      capacity: 500,
    },
    {
      id: 4,
      name: "OYO Hotel & Casino",
      address: "115 E. Tropicana Ave, Las Vegas, NV 89109",
      shows: 6,
      capacity: 200,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Venues</h1>
          <p className="text-muted-foreground">
            Manage all venues and showrooms
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/venues/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Venue
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search venues..."
              className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </CardContent>
      </Card>

      {/* Venues Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {venues.map((venue) => (
          <Card key={venue.id} className="overflow-hidden group">
            <div className="aspect-video w-full bg-muted relative overflow-hidden">
              <Image
                src={`https://picsum.photos/seed/venue-${venue.id}/800/450`}
                alt={venue.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    {venue.name}
                  </CardTitle>
                  <CardDescription>{venue.address}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/venues/${venue.id}`} className="flex items-center">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Active Shows</p>
                  <p className="text-2xl font-bold">{venue.shows}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p className="text-2xl font-bold">{venue.capacity}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

