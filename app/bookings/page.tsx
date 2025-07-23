"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
import { BookingManagementModal } from "@/components/booking-management-modal"
import Link from "next/link"
import { 
  Calendar, 
  Clock, 
  Car, 
  MapPin, 
  Search,
  Filter,
  Eye,
  Edit,
  X,
  TrendingUp,
  DollarSign,
  CalendarDays,
  CheckCircle,
  AlertCircle,
  History,
  Plus,
  Users,
  CreditCard,
  BarChart3
} from "lucide-react"

interface Booking {
  id: string
  user_id: string
  status: string
  pickup_date: string
  return_date: string
  pickup_location: string
  special_requests?: string
  total_amount: number
  total_hours: number
  payment_status: string
  payment_id?: string
  created_at: string
  vehicles: {
    id: string
    name: string
    brand: string
    model: string
    year: number
    images?: string[]
    price_per_hour: number
    vehicle_categories?: {
      name: string
      icon: string
    }
  }
}

export default function EnhancedBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [modalAction, setModalAction] = useState<'cancel' | 'modify'>('cancel')
  const [modalOpen, setModalOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [user])

  const fetchBookings = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          vehicles (
            *,
            vehicle_categories (
              name,
              icon
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error("Error fetching bookings:", error)
      toast.error("Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const totalBookings = bookings.length
  const totalSpent = bookings
    .filter(b => b.payment_status === 'paid')
    .reduce((sum, b) => sum + Number(b.total_amount), 0)
  const totalHours = bookings.reduce((sum, b) => sum + Number(b.total_hours), 0)
  const upcomingBookings = bookings.filter(b => 
    new Date(b.pickup_date) > new Date() && 
    ['pending', 'confirmed'].includes(b.status)
  ).length

  // Filter and sort bookings
  const filteredBookings = bookings
    .filter(booking => {
      const matchesSearch = booking.vehicles.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           booking.pickup_location.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || booking.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "pickup-date":
          return new Date(a.pickup_date).getTime() - new Date(b.pickup_date).getTime()
        case "amount":
          return Number(b.total_amount) - Number(a.total_amount)
        default:
          return 0
      }
    })

  // Categorize bookings
  const currentBookings = filteredBookings.filter(b => 
    ['pending', 'confirmed', 'active'].includes(b.status)
  )
  const pastBookings = filteredBookings.filter(b => 
    ['completed', 'cancelled'].includes(b.status)
  )
  const upcomingFiltered = filteredBookings.filter(b => 
    new Date(b.pickup_date) > new Date() && 
    ['pending', 'confirmed'].includes(b.status)
  )

  const canModifyOrCancel = (booking: Booking, action: 'modify' | 'cancel') => {
    const pickupTime = new Date(booking.pickup_date)
    const now = new Date()
    const hoursUntilPickup = (pickupTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    if (!['pending', 'confirmed'].includes(booking.status)) return false
    
    if (action === 'cancel') {
      return hoursUntilPickup >= 2
    } else {
      return hoursUntilPickup >= 4
    }
  }

  const handleOpenModal = (booking: Booking, action: 'cancel' | 'modify') => {
    setSelectedBooking(booking)
    setModalAction(action)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedBooking(null)
  }

  const handleBookingUpdated = () => {
    fetchBookings()
  }

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmed: "bg-green-100 text-green-800 border-green-200",
      active: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-gray-100 text-gray-800 border-gray-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    }
    return statusStyles[status as keyof typeof statusStyles] || statusStyles.pending
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    }
    return statusStyles[status as keyof typeof statusStyles] || statusStyles.pending
  }

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Vehicle Image */}
          <div className="w-full md:w-48 h-32 flex-shrink-0">
            <img
              src={booking.vehicles.images?.[0] || "/placeholder.jpg"}
              alt={booking.vehicles.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          {/* Booking Details */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {booking.vehicles.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {booking.vehicles.brand} {booking.vehicles.model} • {booking.vehicles.year}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusBadge(booking.status)}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
                <Badge variant="outline" className={getPaymentStatusBadge(booking.payment_status)}>
                  {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{booking.pickup_location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>{booking.total_hours} hours</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{new Date(booking.pickup_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="font-semibold">₹{booking.total_amount}</span>
              </div>
            </div>

            {booking.special_requests && (
              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                <strong>Special Requests:</strong> {booking.special_requests}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex md:flex-col gap-2 md:w-32">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/vehicles/${booking.vehicles.id}`, '_blank')}
              className="flex-1 md:flex-none"
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            
            {canModifyOrCancel(booking, 'modify') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenModal(booking, 'modify')}
                className="flex-1 md:flex-none text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Modify
              </Button>
            )}
            
            {canModifyOrCancel(booking, 'cancel') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenModal(booking, 'cancel')}
                className="flex-1 md:flex-none text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600 mt-2">Manage and track all your vehicle reservations</p>
            </div>
            <Link href="/vehicles">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                <Plus className="w-4 h-4 mr-2" />
                Book New Vehicle
              </Button>
            </Link>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">{totalBookings}</div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">₹{totalSpent.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mx-auto mb-2">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="text-2xl font-bold text-yellow-600">{totalHours}</div>
                <div className="text-sm text-gray-600">Total Hours</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-2">
                  <CalendarDays className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600">{upcomingBookings}</div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
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
                    placeholder="Search by vehicle or location..."
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
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
                    <SelectItem value="pickup-date">Pickup Date</SelectItem>
                    <SelectItem value="amount">Amount (High to Low)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                    setSortBy("newest")
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({filteredBookings.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({upcomingFiltered.length})</TabsTrigger>
            <TabsTrigger value="current">Current ({currentBookings.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredBookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || statusFilter !== "all" 
                      ? "Try adjusting your filters or search terms." 
                      : "You haven't made any bookings yet."}
                  </p>
                  <Link href="/vehicles">
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                      Browse Vehicles
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              filteredBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingFiltered.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming bookings</h3>
                  <p className="text-gray-600 mb-4">Plan your next trip with our premium vehicles.</p>
                  <Link href="/vehicles">
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                      Book Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              upcomingFiltered.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>

          <TabsContent value="current" className="space-y-4">
            {currentBookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No current bookings</h3>
                  <p className="text-gray-600">All your active bookings will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              currentBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastBookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No past bookings</h3>
                  <p className="text-gray-600">Your completed and cancelled bookings will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Booking Management Modal */}
      <BookingManagementModal
        booking={selectedBooking}
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onBookingUpdated={handleBookingUpdated}
        action={modalAction}
      />
    </div>
  )
}
