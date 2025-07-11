"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, MapPin, Clock, Search } from "lucide-react"
import { format } from "date-fns"

interface BookingWidgetProps {
  className?: string
  variant?: "floating" | "inline"
}

export function BookingWidget({ className = "", variant = "floating" }: BookingWidgetProps) {
  const [pickupLocation, setPickupLocation] = useState("")
  const [pickupDate, setPickupDate] = useState("")
  const [returnDate, setReturnDate] = useState("")
  const router = useRouter()

  const handleSearch = () => {
    if (!pickupLocation || !pickupDate || !returnDate) {
      alert("Please fill in all fields")
      return
    }

    const searchParams = new URLSearchParams({
      location: pickupLocation,
      pickup: pickupDate,
      return: returnDate,
    })

    router.push(`/vehicles?${searchParams.toString()}`)
  }

  const today = format(new Date(), "yyyy-MM-dd'T'HH:mm")

  if (variant === "inline") {
    return (
      <Card className={`bg-white shadow-lg ${className}`}>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Pickup Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Enter city or location"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Pickup Date & Time</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="datetime-local"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  min={today}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Return Date & Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="datetime-local"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  min={pickupDate || today}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleSearch}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold h-10"
              >
                <Search className="w-4 h-4 mr-2" />
                Search Vehicles
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`bg-white/95 backdrop-blur-md shadow-lg border rounded-lg ${className}`}>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Pickup Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Enter city"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="pl-10 border-0 bg-transparent focus:ring-1 focus:ring-yellow-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Pickup Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="datetime-local"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                min={today}
                className="pl-10 border-0 bg-transparent focus:ring-1 focus:ring-yellow-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Return Date</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="datetime-local"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                min={pickupDate || today}
                className="pl-10 border-0 bg-transparent focus:ring-1 focus:ring-yellow-500"
              />
            </div>
          </div>

          <Button onClick={handleSearch} className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold h-10">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </div>
    </div>
  )
}
