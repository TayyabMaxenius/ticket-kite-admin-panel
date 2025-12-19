"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"

export default function EditShowPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState({
    name: "",
    description: "",
    venue: "",
    price: "",
    discountedPrice: "",
    duration: "",
    category: "",
    status: "active",
    image: "",
  })

  useEffect(() => {
    // Load show data if editing
    if (id && id !== "new") {
      loadShow()
    }
  }, [id])

  const loadShow = async () => {
    // In a real app, fetch from your API/database
    // For now, using placeholder data
    setShow({
      name: "Sir Elton - At the Piano",
      description: "The Music of Elton John",
      venue: "Modern Showrooms at Alexis Park Resort",
      price: "99.95",
      discountedPrice: "44.95",
      duration: "70-75",
      category: "Tribute",
      status: "active",
      image: "/show-placeholder.jpg",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Here you would save to your API/database
      // await fetch('/api/shows', { method: 'POST', body: JSON.stringify(show) })
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      alert(id === "new" ? "Show created successfully!" : "Show updated successfully!")
      router.push("/dashboard/shows")
    } catch (error: any) {
      alert("Error saving show: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/shows">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {id === "new" ? "Create New Show" : "Edit Show"}
          </h1>
          <p className="text-muted-foreground">
            {id === "new" ? "Add a new show to your listings" : "Update show information"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Show name and description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Show Name *</Label>
                <Input
                  id="name"
                  value={show.name}
                  onChange={(e) => setShow({ ...show, name: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="Sir Elton - At the Piano"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={show.description}
                  onChange={(e) =>
                    setShow({ ...show, description: e.target.value })
                  }
                  disabled={loading}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="The Music of Elton John"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Venue & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="venue">Venue *</Label>
                <Input
                  id="venue"
                  value={show.venue}
                  onChange={(e) => setShow({ ...show, venue: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="Modern Showrooms"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={show.category}
                  onChange={(e) =>
                    setShow({ ...show, category: e.target.value })
                  }
                  disabled={loading}
                  placeholder="Tribute, Comedy, Magic, etc."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing & Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price">Regular Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={show.price}
                  onChange={(e) => setShow({ ...show, price: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="99.95"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountedPrice">Discounted Price ($)</Label>
                <Input
                  id="discountedPrice"
                  type="number"
                  step="0.01"
                  value={show.discountedPrice}
                  onChange={(e) =>
                    setShow({ ...show, discountedPrice: e.target.value })
                  }
                  disabled={loading}
                  placeholder="44.95"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  value={show.duration}
                  onChange={(e) =>
                    setShow({ ...show, duration: e.target.value })
                  }
                  disabled={loading}
                  placeholder="70-75"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={show.status}
                  onChange={(e) =>
                    setShow({ ...show, status: e.target.value })
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
                {id === "new" ? "Create Show" : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

