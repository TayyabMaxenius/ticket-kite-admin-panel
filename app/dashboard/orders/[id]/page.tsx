"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"

export default function EditOrderPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState({
    orderId: "",
    customer: "",
    customerEmail: "",
    customerPhone: "",
    show: "",
    date: "",
    time: "",
    tickets: "",
    ticketType: "standard",
    total: "",
    status: "pending",
    paymentMethod: "",
    notes: "",
  })

  useEffect(() => {
    // Load order data if editing
    if (id && id !== "new") {
      loadOrder()
    }
  }, [id])

  const loadOrder = async () => {
    // In a real app, fetch from your API/database
    // For now, using placeholder data based on the order ID
    const orderData: Record<string, typeof order> = {
      "ORD-001": {
        orderId: "ORD-001",
        customer: "John Doe",
        customerEmail: "john.doe@example.com",
        customerPhone: "(555) 123-4567",
        show: "Sir Elton - At the Piano",
        date: "2025-12-19",
        time: "19:00",
        tickets: "2",
        ticketType: "standard",
        total: "89.90",
        status: "confirmed",
        paymentMethod: "credit_card",
        notes: "",
      },
      "ORD-002": {
        orderId: "ORD-002",
        customer: "Jane Smith",
        customerEmail: "jane.smith@example.com",
        customerPhone: "(555) 234-5678",
        show: "Sinatra Live!",
        date: "2025-12-20",
        time: "20:00",
        tickets: "4",
        ticketType: "vip",
        total: "179.80",
        status: "confirmed",
        paymentMethod: "paypal",
        notes: "",
      },
      "ORD-003": {
        orderId: "ORD-003",
        customer: "Mike Johnson",
        customerEmail: "mike.johnson@example.com",
        customerPhone: "(555) 345-6789",
        show: "Motown Brunch",
        date: "2025-12-21",
        time: "11:00",
        tickets: "1",
        ticketType: "standard",
        total: "58.95",
        status: "pending",
        paymentMethod: "credit_card",
        notes: "",
      },
    }

    if (id && orderData[id]) {
      setOrder(orderData[id])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Here you would save to your API/database
      // await fetch('/api/orders', { method: 'POST', body: JSON.stringify(order) })
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      alert(id === "new" ? "Order created successfully!" : "Order updated successfully!")
      router.push("/dashboard/orders")
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error occurred"
      alert("Error saving order: " + message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {id === "new" ? "Create New Order" : "Edit Order"}
          </h1>
          <p className="text-muted-foreground">
            {id === "new" ? "Add a new order to the system" : "Update order information"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
              <CardDescription>Order details and identification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orderId">Order ID *</Label>
                  <Input
                    id="orderId"
                    value={order.orderId}
                    onChange={(e) => setOrder({ ...order, orderId: e.target.value })}
                    required
                    disabled={loading || id !== "new"}
                    placeholder="ORD-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <select
                    id="status"
                    value={order.status}
                    onChange={(e) =>
                      setOrder({ ...order, status: e.target.value })
                    }
                    disabled={loading}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer Name *</Label>
                <Input
                  id="customer"
                  value={order.customer}
                  onChange={(e) => setOrder({ ...order, customer: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={order.customerEmail}
                  onChange={(e) => setOrder({ ...order, customerEmail: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="john.doe@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={order.customerPhone}
                  onChange={(e) => setOrder({ ...order, customerPhone: e.target.value })}
                  disabled={loading}
                  placeholder="(555) 123-4567"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Show & Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="show">Show *</Label>
                <Input
                  id="show"
                  value={order.show}
                  onChange={(e) => setOrder({ ...order, show: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="Sir Elton - At the Piano"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={order.date}
                    onChange={(e) => setOrder({ ...order, date: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={order.time}
                    onChange={(e) => setOrder({ ...order, time: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tickets">Number of Tickets *</Label>
                  <Input
                    id="tickets"
                    type="number"
                    value={order.tickets}
                    onChange={(e) => setOrder({ ...order, tickets: e.target.value })}
                    required
                    disabled={loading}
                    placeholder="2"
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticketType">Ticket Type</Label>
                  <select
                    id="ticketType"
                    value={order.ticketType}
                    onChange={(e) =>
                      setOrder({ ...order, ticketType: e.target.value })
                    }
                    disabled={loading}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="standard">Standard</option>
                    <option value="vip">VIP</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Payment & Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total">Total Amount ($) *</Label>
                  <Input
                    id="total"
                    type="number"
                    step="0.01"
                    value={order.total}
                    onChange={(e) => setOrder({ ...order, total: e.target.value })}
                    required
                    disabled={loading}
                    placeholder="89.90"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <select
                    id="paymentMethod"
                    value={order.paymentMethod}
                    onChange={(e) =>
                      setOrder({ ...order, paymentMethod: e.target.value })
                    }
                    disabled={loading}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select payment method</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="cash">Cash</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  value={order.notes}
                  onChange={(e) =>
                    setOrder({ ...order, notes: e.target.value })
                  }
                  disabled={loading}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Additional notes about this order..."
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
                {id === "new" ? "Create Order" : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

