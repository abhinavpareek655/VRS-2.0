"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function OrdersPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    getUser()
  }, [])

  useEffect(() => {
    if (userId) fetchBookings()
  }, [userId])

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setUserId(user.id)
    else router.push("/login")
  }

  const fetchBookings = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("bookings")
      .select("*, vehicles(*, vehicle_categories(name, icon))")
      .eq("user_id", userId)
      .order("pickup_date", { ascending: false })
    if (!error && data) setBookings(data)
    setLoading(false)
  }

  const currentStatuses = ["pending", "confirmed", "active"]
  const pastStatuses = ["completed", "cancelled"]
  const currentOrders = bookings.filter(b => currentStatuses.includes(b.status))
  const pastOrders = bookings.filter(b => pastStatuses.includes(b.status))

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading your orders...</div>
        ) : (
          <>
            <section className="mb-10">
              <h2 className="text-xl font-semibold mb-4">Current Orders</h2>
              {currentOrders.length === 0 ? (
                <div className="text-gray-500">No current orders.</div>
              ) : (
                <div className="grid gap-6">
                  {currentOrders.map(order => (
                    <Card key={order.id} className="border-l-4 border-yellow-500">
                      <CardContent className="flex flex-col md:flex-row gap-4 p-4 items-center md:items-start">
                        <img
                          src={order.vehicles?.images?.[0] || "/placeholder.jpg"}
                          alt={order.vehicles?.name || "Vehicle"}
                          className="w-32 h-24 object-cover rounded-md border"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-bold">{order.vehicles?.name}</span>
                            <Badge className="bg-yellow-100 text-yellow-800 capitalize">{order.status}</Badge>
                          </div>
                          <div className="text-gray-600 text-sm mb-1">
                            {order.vehicles?.brand} {order.vehicles?.model} • {order.vehicles?.year}
                          </div>
                          <div className="text-gray-500 text-xs mb-1">
                            {order.pickup_location}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Pickup:</span> {new Date(order.pickup_date).toLocaleString()}<br />
                            <span className="font-medium">Return:</span> {new Date(order.return_date).toLocaleString()}
                          </div>
                          <div className="text-sm mt-1">
                            <span className="font-medium">Amount:</span> ₹{order.total_amount}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button variant="outline" onClick={() => router.push(`/vehicles/${order.vehicle_id}`)}>
                            View Vehicle
                          </Button>
                          {/* Optionally, add cancel or modify actions here */}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-4">Past Orders</h2>
              {pastOrders.length === 0 ? (
                <div className="text-gray-500">No past orders.</div>
              ) : (
                <div className="grid gap-6">
                  {pastOrders.map(order => (
                    <Card key={order.id} className="border-l-4 border-gray-300">
                      <CardContent className="flex flex-col md:flex-row gap-4 p-4 items-center md:items-start">
                        <img
                          src={order.vehicles?.images?.[0] || "/placeholder.jpg"}
                          alt={order.vehicles?.name || "Vehicle"}
                          className="w-32 h-24 object-cover rounded-md border"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-bold">{order.vehicles?.name}</span>
                            <Badge className="bg-gray-200 text-gray-700 capitalize">{order.status}</Badge>
                          </div>
                          <div className="text-gray-600 text-sm mb-1">
                            {order.vehicles?.brand} {order.vehicles?.model} • {order.vehicles?.year}
                          </div>
                          <div className="text-gray-500 text-xs mb-1">
                            {order.pickup_location}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Pickup:</span> {new Date(order.pickup_date).toLocaleString()}<br />
                            <span className="font-medium">Return:</span> {new Date(order.return_date).toLocaleString()}
                          </div>
                          <div className="text-sm mt-1">
                            <span className="font-medium">Amount:</span> ₹{order.total_amount}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button variant="outline" onClick={() => router.push(`/vehicles/${order.vehicle_id}`)}>
                            View Vehicle
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
} 