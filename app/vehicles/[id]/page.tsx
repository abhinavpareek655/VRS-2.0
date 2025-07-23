"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { RazorpayPaymentForm } from "@/components/razorpay-payment-form"
import { toast } from "sonner"
import dynamic from "next/dynamic"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useCallback } from "react"
import { Calendar } from "lucide-react"

// Helper to reverse geocode lat/lng to address (using Nominatim API)
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
  const data = await res.json()
  return data.display_name || `${lat}, ${lng}`
}

const MapWithSearch = dynamic(() => import("@/components/MapWithSearch"), { ssr: false })

export default function VehicleDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [vehicle, setVehicle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState({
    pickupLocation: searchParams.get("location") || "",
    pickupDate: searchParams.get("pickup") || "",
    returnDate: searchParams.get("return") || "",
    specialRequests: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState("")
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [errorMsg, setErrorMsg] = useState("")
  const [showPayment, setShowPayment] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  useEffect(() => {
    fetchVehicle()
    fetchBookings()
  }, [id])

  const fetchVehicle = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("vehicles")
      .select("*, vehicle_categories(name, icon)")
      .eq("id", id)
      .single()
    if (!error) setVehicle(data)
    setLoading(false)
  }

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("pickup_date, return_date")
      .eq("vehicle_id", id)
      .in("status", ["pending", "confirmed", "active"])
    if (!error && data) setBookings(data)
  }

  // Convert bookings to disabled date ranges
  const getDisabledDateRanges = useCallback(() => {
    return bookings.map(b => ({
      start: new Date(b.pickup_date),
      end: new Date(b.return_date)
    }))
  }, [bookings])

  // For disabling time slots
  const isTimeDisabled = (date: Date) => {
    // Check if this date/time overlaps with any booking
    return bookings.some(b => {
      const start = new Date(b.pickup_date)
      const end = new Date(b.return_date)
      return date >= start && date < end
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setBooking({ ...booking, [e.target.name]: e.target.value })
  }

  // Helper function to calculate total hours and amount
  const calculateTotalHours = () => {
    if (!booking.pickupDate || !booking.returnDate) return 1
    const start = new Date(booking.pickupDate)
    const end = new Date(booking.returnDate)
    const hoursDifference = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    return Math.max(1, Math.ceil(hoursDifference))
  }

  const calculateTotalAmount = () => {
    const originalAmount = calculateTotalHours() * (vehicle?.price_per_day || 0) // price_per_day is now price_per_hour
    return process.env.NEXT_PUBLIC_TESTING_MODE === 'true' ? 1 : originalAmount
  }

  const getOriginalAmount = () => {
    return calculateTotalHours() * (vehicle?.price_per_day || 0)
  }

  // Check if slot is still available (real-time check)
  const checkSlotAvailability = async (pickupDate: string, returnDate: string) => {
    const { data: existingBookings, error } = await supabase
      .from('bookings')
      .select('pickup_date, return_date')
      .eq('vehicle_id', id)
      .in('status', ['pending', 'confirmed', 'active'])

    if (error) {
      console.error('Error checking availability:', error)
      return false
    }

    const requestStart = new Date(pickupDate)
    const requestEnd = new Date(returnDate)

    // Check for conflicts with existing bookings
    return !existingBookings.some(booking => {
      const existingStart = new Date(booking.pickup_date)
      const existingEnd = new Date(booking.return_date)
      
      return (
        (requestStart >= existingStart && requestStart < existingEnd) ||
        (requestEnd > existingStart && requestEnd <= existingEnd) ||
        (requestStart <= existingStart && requestEnd >= existingEnd)
      )
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    
    // Validation
    if (!booking.pickupLocation || !booking.pickupDate || !booking.returnDate) {
      toast.error("Please fill in all required fields.")
      return
    }

    const pickup = new Date(booking.pickupDate)
    const ret = new Date(booking.returnDate)
    
    if (pickup >= ret) {
      setErrorMsg("Pickup date and time must be before return date and time.")
      return
    }

    // Check for minimum 3-hour gap
    const hoursDifference = (ret.getTime() - pickup.getTime()) / (1000 * 60 * 60)
    if (hoursDifference < 3) {
      setErrorMsg("There must be at least a 3-hour gap between pickup and return time.")
      return
    }

    setSubmitting(true)

    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in to book a vehicle.")
        setSubmitting(false)
        return
      }

      // Real-time availability check before proceeding to payment
      const isSlotAvailable = await checkSlotAvailability(booking.pickupDate, booking.returnDate)
      if (!isSlotAvailable) {
        setErrorMsg("This time slot is no longer available. Please select different dates.")
        setSubmitting(false)
        await fetchBookings() // Refresh bookings
        return
      }

      // Proceed to payment
      setShowPayment(true)
      setSubmitting(false)
    } catch (error) {
      console.error('Error during booking validation:', error)
      toast.error("An error occurred. Please try again.")
      setSubmitting(false)
    }
  }

  const handlePaymentSuccess = (bookingId: string) => {
    setShowPayment(false)
    setBookingSuccess(true)
    setConfirmation("🎉 Booking confirmed successfully! Your booking ID is: " + bookingId)
    toast.success("Payment successful! Booking confirmed.")
    
    // Redirect to dashboard after 3 seconds
    setTimeout(() => router.push("/"), 3000)
  }

  const handlePaymentCancel = () => {
    setShowPayment(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card>
          <CardContent className="p-8 text-center">Vehicle not found.</CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="mb-8 p-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center justify-center">
              <img
                src={vehicle.images?.[0] || "/placeholder.jpg"}
                alt={vehicle.name}
                className="rounded-lg w-full h-64 object-cover mb-4"
              />
              <div className="flex gap-2 flex-wrap">
                {vehicle.features?.map((f: string) => (
                  <Badge key={f} className="bg-yellow-100 text-yellow-800">{f}</Badge>
                ))}
              </div>
            </div>
            <div>
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  {vehicle.vehicle_categories?.icon} {vehicle.name}
                </CardTitle>
                <CardDescription className="mb-2">
                  {vehicle.brand} {vehicle.model} • {vehicle.year}
                </CardDescription>
                <div className="text-lg font-semibold text-yellow-600 mb-2">
                  {process.env.NEXT_PUBLIC_TESTING_MODE === 'true' ? (
                    <div className="space-y-1">
                      <div className="line-through text-gray-500 text-sm">₹{vehicle.price_per_day} / hour</div>
                      <div className="text-green-600 font-bold">₹1 / booking (Testing Mode) 🧪</div>
                    </div>
                  ) : (
                    `₹${vehicle.price_per_day} / hour`
                  )}
                </div>
                <div className="text-gray-600 mb-2">
                  {vehicle.seats} seats • {vehicle.fuel_type} • {vehicle.transmission}
                </div>
              </CardHeader>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Book this Vehicle</CardTitle>
            <CardDescription>Fill in your trip details below.</CardDescription>
          </CardHeader>
          <CardContent>
            {bookingSuccess || confirmation ? (
              <div className="text-green-600 font-semibold text-center py-8">{confirmation}</div>
            ) : showPayment ? (
              <div className="flex flex-col items-center space-y-4">
                <RazorpayPaymentForm
                  vehicleId={vehicle.id}
                  vehicleName={vehicle.name}
                  pricePerHour={vehicle.price_per_day}
                  pickupDate={booking.pickupDate}
                  returnDate={booking.returnDate}
                  pickupLocation={booking.pickupLocation}
                  specialRequests={booking.specialRequests}
                  totalHours={calculateTotalHours()}
                  totalAmount={calculateTotalAmount()}
                  onSuccess={handlePaymentSuccess}
                  onCancel={handlePaymentCancel}
                />
              </div>
            ) : (
              <form className="grid gap-4" onSubmit={handleSubmit}>
                {errorMsg && (
                  <div className="text-red-600 font-semibold text-center py-2">{errorMsg}</div>
                )}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Pickup Location *</label>
                    <MapWithSearch
                      value={booking.pickupLocation}
                      onLocationChange={(address, latlng) => setBooking(b => ({ ...b, pickupLocation: address }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Pickup Date & Time *</label>
                    <DatePicker
                      selected={booking.pickupDate ? new Date(booking.pickupDate) : null}
                      onChange={date => setBooking(b => ({ ...b, pickupDate: date ? date.toISOString() : "" }))}
                      showTimeSelect
                      timeIntervals={30}
                      minDate={new Date()}
                      excludeDateIntervals={getDisabledDateRanges()}
                      filterTime={date => !isTimeDisabled(date)}
                      dateFormat="yyyy-MM-dd h:mm aa"
                      className="w-full border rounded px-3 py-2 text-base focus:ring-2 focus:ring-yellow-500"
                      placeholderText="📆 Select pickup date & time"
                      required
                      popperClassName="z-[99999]"
                      portalId="datepicker-portal"
                    >
                      <Calendar />
                    </DatePicker>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Return Date & Time *</label>
                    <DatePicker
                      selected={booking.returnDate ? new Date(booking.returnDate) : null}
                      onChange={date => setBooking(b => ({ ...b, returnDate: date ? date.toISOString() : "" }))}
                      showTimeSelect
                      timeIntervals={30}
                      minDate={booking.pickupDate ? new Date(booking.pickupDate) : new Date()}
                      excludeDateIntervals={getDisabledDateRanges()}
                      filterTime={date => !isTimeDisabled(date)}
                      dateFormat="yyyy-MM-dd h:mm aa"
                      className="w-full border rounded px-3 py-2 text-base focus:ring-2 focus:ring-yellow-500"
                      placeholderText="📆 Select return date & time"
                      required
                      popperClassName="z-[99999]"
                      portalId="datepicker-portal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Special Requests</label>
                    <Input
                      name="specialRequests"
                      placeholder="Optional"
                      value={booking.specialRequests}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                {/* Booking Summary */}
                {booking.pickupDate && booking.returnDate && (
                  <div className="bg-gray-50 p-4 rounded-lg mt-4">
                    {process.env.NEXT_PUBLIC_TESTING_MODE === 'true' && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="font-semibold text-green-800 text-sm">🧪 Testing Mode</span>
                        </div>
                        <p className="text-xs text-green-700">Special ₹1 pricing for testing period</p>
                      </div>
                    )}
                    <h3 className="font-semibold mb-2">Booking Summary</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span>Duration:</span>
                      <span>{calculateTotalHours()} hours</span>
                      <span>Rate per hour:</span>
                      <span>₹{vehicle.price_per_day}</span>
                      {process.env.NEXT_PUBLIC_TESTING_MODE === 'true' ? (
                        <>
                          <span>Subtotal:</span>
                          <span className="line-through text-gray-500">₹{getOriginalAmount()}</span>
                          <span>Testing Discount:</span>
                          <span className="text-green-600">-₹{getOriginalAmount() - 1}</span>
                          <span className="font-semibold text-green-600">Testing Price:</span>
                          <span className="font-semibold text-lg text-green-600">₹1</span>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold">Total Amount:</span>
                          <span className="font-semibold text-lg">₹{calculateTotalAmount()}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold mt-4"
                  disabled={submitting}
                >
                  {submitting ? "Checking availability..." : "Proceed to Payment"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 