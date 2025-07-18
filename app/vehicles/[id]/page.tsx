"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
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
    if ((ret.getTime() - pickup.getTime()) < 60 * 60 * 1000) {
      setErrorMsg("There must be at least a 1-hour gap between pickup and return.")
      return
    }
    setSubmitting(true)
    // Calculate total days and amount
    const start = new Date(booking.pickupDate)
    const end = new Date(booking.returnDate)
    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
    const totalAmount = totalDays * (vehicle?.price_per_day || 0)
    // Get user id from supabase auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error("You must be logged in to book a vehicle.")
      setSubmitting(false)
      return
    }
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      vehicle_id: vehicle.id,
      pickup_location: booking.pickupLocation,
      pickup_date: booking.pickupDate,
      return_date: booking.returnDate,
      total_days: totalDays,
      total_amount: totalAmount,
      special_requests: booking.specialRequests,
    })
    setSubmitting(false)
    if (error) {
      toast.error("Booking failed. Please try again.")
    } else {
      setConfirmation("Your booking has been received! We'll contact you soon.")
      toast.success("Booking successful!")
      setTimeout(() => router.push("/dashboard"), 2000)
    }
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
                  ₹{vehicle.price_per_day} / day
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
            {confirmation ? (
              <div className="text-green-600 font-semibold text-center py-8">{confirmation}</div>
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
                <Button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold mt-4"
                  disabled={submitting}
                >
                  {submitting ? "Booking..." : "Book Now"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 