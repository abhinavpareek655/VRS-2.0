"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/supabase"
import { 
  Calendar, 
  Clock, 
  Car, 
  MapPin, 
  Phone, 
  Search,
  Filter,
  Download,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Eye,
  Trash2
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

type Booking = Database["public"]["Tables"]["bookings"]["Row"] & {
  vehicles?: Database["public"]["Tables"]["vehicles"]["Row"]
  start_time: string
  end_time: string
  status: string
  created_at: string
  id: string
  total_price?: number
  total_hours?: number
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const { user } = useAuth()
  const { toast } = useToast()

  // Helper function to safely format dates
  const formatSafeDate = (dateString: string | null | undefined, formatStr: string): string => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "N/A"
      return format(date, formatStr)
    } catch (error) {
      console.warn("Invalid date format:", dateString)
      return "N/A"
    }
  }

  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [user])

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          vehicles (
            id,
            name,
            brand,
            model,
            type,
            price_per_day,
            images,
            location
          )
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error("Error fetching bookings:", error)
      toast({
        title: "Error fetching bookings",
        description: "Please try refreshing the page.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId)

      if (error) throw error

      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled successfully.",
      })
      
      fetchBookings() // Refresh the list
    } catch (error) {
      console.error("Error cancelling booking:", error)
      toast({
        title: "Error cancelling booking",
        description: "Please try again or contact support.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      cancelled: { color: "bg-red-100 text-red-800", icon: XCircle },
      completed: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const canCancelBooking = (booking: Booking) => {
    if (booking.status === "cancelled" || booking.status === "completed") return false
    
    if (!booking.start_time) return false
    
    try {
      const startTime = new Date(booking.start_time)
      if (isNaN(startTime.getTime())) return false
      
      const now = new Date()
      const hoursUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60)
      
      return hoursUntilStart > 2 // Can cancel if more than 2 hours before start
    } catch (error) {
      console.warn("Error parsing start time:", booking.start_time)
      return false
    }
  }

  const filteredBookings = bookings
    .filter(booking => {
      if (statusFilter !== "all" && booking.status !== statusFilter) return false
      if (searchTerm && !booking.vehicles?.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !booking.vehicles?.brand.toLowerCase().includes(searchTerm.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          const dateA = new Date(a.created_at || 0)
          const dateB = new Date(b.created_at || 0)
          return dateB.getTime() - dateA.getTime()
        case "oldest":
          const dateA2 = new Date(a.created_at || 0)
          const dateB2 = new Date(b.created_at || 0)
          return dateA2.getTime() - dateB2.getTime()
        case "start-date":
          const startA = new Date(a.start_time || 0)
          const startB = new Date(b.start_time || 0)
          return startA.getTime() - startB.getTime()
        default:
          return 0
      }
    })

  const getBookingsByStatus = (status: string) => {
    return bookings.filter(booking => booking.status === status).length
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please log in to view your bookings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600 mt-2">Manage and track all your vehicle reservations</p>
            </div>
            <Link href="/vehicles">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                <Car className="w-4 h-4 mr-2" />
                Book New Vehicle
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{bookings.length}</div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{getBookingsByStatus("confirmed")}</div>
                <div className="text-sm text-gray-600">Confirmed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{getBookingsByStatus("pending")}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{getBookingsByStatus("completed")}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by vehicle..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="start-date">Start Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-500 mb-6">
                {bookings.length === 0 
                  ? "You haven't made any bookings yet. Start exploring our fleet!"
                  : "No bookings match your current filters."
                }
              </p>
              <Link href="/vehicles">
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                  Browse Vehicles
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Vehicle Image */}
                    <div className="lg:w-48 flex-shrink-0">
                      <img
                        src={booking.vehicles?.images?.[0] || "/placeholder.svg"}
                        alt={booking.vehicles?.name}
                        className="w-full h-32 lg:h-24 object-cover rounded-lg"
                      />
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {booking.vehicles?.name}
                          </h3>
                          <p className="text-gray-600">
                            {booking.vehicles?.brand} {booking.vehicles?.model} • {booking.vehicles?.type}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(booking.status)}
                          <Badge variant="outline">
                            Booking #{booking.id.slice(-8)}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">
                              Start: {formatSafeDate(booking.start_time, "MMM d, yyyy")}
                            </div>
                            <div className="text-gray-600">
                              {formatSafeDate(booking.start_time, "h:mm a")}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">
                              End: {formatSafeDate(booking.end_time, "MMM d, yyyy")}
                            </div>
                            <div className="text-gray-600">
                              {formatSafeDate(booking.end_time, "h:mm a")}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">{booking.vehicles?.location || "N/A"}</div>
                            <div className="text-gray-600">{booking.total_hours || 0} hours</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t">
                        <div className="flex items-center gap-4">
                          <div className="text-lg font-bold text-gray-900">
                            ₹{booking.total_price}
                          </div>
                          <div className="text-sm text-gray-600">
                            ₹{booking.vehicles?.price_per_day}/hour
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link href={`/vehicles/${booking.vehicles?.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View Vehicle
                            </Button>
                          </Link>
                          
                          {canCancelBooking(booking) && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel this booking? This action cannot be undone.
                                    Cancellation charges may apply as per our policy.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => cancelBooking(booking.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Cancel Booking
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Help Section */}
        <Card className="mt-8 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 mb-4">
              Having issues with your booking? Our support team is here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact">
                <Button variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </Link>
              <Button variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                <Phone className="w-4 h-4 mr-2" />
                Emergency: +91 98765 00000
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
