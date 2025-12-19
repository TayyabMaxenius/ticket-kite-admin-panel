"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"

export default function EditVenuePage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [loading, setLoading] = useState(false)
  const [venue, setVenue] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    capacity: "",
    phone: "",
    email: "",
    website: "",
    status: "active",
  })

  useEffect(() => {
    // Load venue data if editing
    if (id && id !== "new") {
      loadVenue()
    }
  }, [id])

  const loadVenue = async () => {
    // In a real app, fetch from your API/database
    // For now, using placeholder data based on the venue ID
    const venueData: Record<string, typeof venue> = {
      "1": {
        name: "Modern Showrooms at Alexis Park Resort",
        address: "375 E. Harmon Ave",
        city: "Las Vegas",
        state: "NV",
        zipCode: "89169",
        capacity: "300",
        phone: "(702) 796-3300",
        email: "info@modernshowrooms.com",
        website: "https://modernshowrooms.com",
        status: "active",
      },
      "2": {
        name: "Alexis Park & Resort",
        address: "375 E. Harmon Ave",
        city: "Las Vegas",
        state: "NV",
        zipCode: "89169",
        capacity: "250",
        phone: "(702) 796-3300",
        email: "info@alexispark.com",
        website: "https://alexispark.com",
        status: "active",
      },
      "3": {
        name: "Ahern Live Showroom",
        address: "300 E. Fremont St",
        city: "Las Vegas",
        state: "NV",
        zipCode: "89101",
        capacity: "500",
        phone: "(702) 555-1234",
        email: "info@ahernlive.com",
        website: "https://ahernlive.com",
        status: "active",
      },
      "4": {
        name: "OYO Hotel & Casino",
        address: "115 E. Tropicana Ave",
        city: "Las Vegas",
        state: "NV",
        zipCode: "89109",
        capacity: "200",
        phone: "(702) 555-5678",
        email: "info@oyohotel.com",
        website: "https://oyohotel.com",
        status: "active",
      },
    }

    if (id && venueData[id]) {
      setVenue(venueData[id])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Here you would save to your API/database
      // await fetch('/api/venues', { method: 'POST', body: JSON.stringify(venue) })
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      alert(id === "new" ? "Venue created successfully!" : "Venue updated successfully!")
      router.push("/dashboard/venues")
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error occurred"
      alert("Error saving venue: " + message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/venues">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {id === "new" ? "Create New Venue" : "Edit Venue"}
          </h1>
          <p className="text-muted-foreground">
            {id === "new" ? "Add a new venue to your listings" : "Update venue information"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Venue name and details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Venue Name *</Label>
                <Input
                  id="name"
                  value={venue.name}
                  onChange={(e) => setVenue({ ...venue, name: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="Modern Showrooms at Alexis Park Resort"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={venue.capacity}
                  onChange={(e) => setVenue({ ...venue, capacity: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={venue.status}
                  onChange={(e) =>
                    setVenue({ ...venue, status: e.target.value })
                  }
                  disabled={loading}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={venue.address}
                  onChange={(e) => setVenue({ ...venue, address: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="375 E. Harmon Ave"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={venue.city}
                    onChange={(e) => setVenue({ ...venue, city: e.target.value })}
                    required
                    disabled={loading}
                    placeholder="Las Vegas"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={venue.state}
                    onChange={(e) => setVenue({ ...venue, state: e.target.value })}
                    required
                    disabled={loading}
                    placeholder="NV"
                    maxLength={2}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={venue.zipCode}
                  onChange={(e) => setVenue({ ...venue, zipCode: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="89169"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={venue.phone}
                  onChange={(e) => setVenue({ ...venue, phone: e.target.value })}
                  disabled={loading}
                  placeholder="(702) 796-3300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={venue.email}
                  onChange={(e) => setVenue({ ...venue, email: e.target.value })}
                  disabled={loading}
                  placeholder="info@venue.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={venue.website}
                  onChange={(e) => setVenue({ ...venue, website: e.target.value })}
                  disabled={loading}
                  placeholder="https://venue.com"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
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
                {id === "new" ? "Create Venue" : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

