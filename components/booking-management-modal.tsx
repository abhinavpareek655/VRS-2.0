"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { Calendar, Clock, MapPin, DollarSign, AlertTriangle, Edit, X } from "lucide-react"

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

interface BookingManagementModalProps {
  booking: Booking | null
  isOpen: boolean
  onClose: () => void
  onBookingUpdated: () => void
  action: 'cancel' | 'modify'
}

export function BookingManagementModal({
  booking,
  isOpen,
  onClose,
  onBookingUpdated,
  action
}: BookingManagementModalProps) {
  const [loading, setLoading] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [newPickupDate, setNewPickupDate] = useState("")
  const [newReturnDate, setNewReturnDate] = useState("")
  const [newPickupLocation, setNewPickupLocation] = useState("")
  const [newSpecialRequests, setNewSpecialRequests] = useState("")

  if (!booking) return null

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation")
      return
    }

    setLoading(true)
    try {
      // Update booking status to cancelled
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          special_requests: booking.special_requests 
            ? `${booking.special_requests}\n\nCancellation Reason: ${cancelReason}`
            : `Cancellation Reason: ${cancelReason}`
        })
        .eq("id", booking.id)

      if (updateError) throw updateError

      // Send cancellation email
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "booking_cancelled",
          bookingId: booking.id,
          vehicleName: booking.vehicles.name,
          pickupDate: booking.pickup_date,
          reason: cancelReason,
          amount: booking.total_amount
        })
      })

      if (!response.ok) {
        console.error("Failed to send cancellation email")
      }

      toast.success("Booking cancelled successfully")
      onBookingUpdated()
      onClose()
      
      // Reset form
      setCancelReason("")
    } catch (error) {
      console.error("Error cancelling booking:", error)
      toast.error("Failed to cancel booking")
    } finally {
      setLoading(false)
    }
  }

  const handleModify = async () => {
    if (!newPickupDate || !newReturnDate || !newPickupLocation.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    const pickupTime = new Date(newPickupDate)
    const returnTime = new Date(newReturnDate)
    
    if (returnTime <= pickupTime) {
      toast.error("Return date must be after pickup date")
      return
    }

    const hoursDifference = (returnTime.getTime() - pickupTime.getTime()) / (1000 * 60 * 60)
    const newTotalAmount = hoursDifference * booking.vehicles.price_per_hour

    setLoading(true)
    try {
      // Update booking details
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          pickup_date: newPickupDate,
          return_date: newReturnDate,
          pickup_location: newPickupLocation,
          special_requests: newSpecialRequests,
          total_hours: hoursDifference,
          total_amount: newTotalAmount,
          status: "pending" // Reset to pending for admin review
        })
        .eq("id", booking.id)

      if (updateError) throw updateError

      // Send modification email
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "booking_modified",
          bookingId: booking.id,
          vehicleName: booking.vehicles.name,
          oldPickupDate: booking.pickup_date,
          newPickupDate: newPickupDate,
          oldAmount: booking.total_amount,
          newAmount: newTotalAmount
        })
      })

      if (!response.ok) {
        console.error("Failed to send modification email")
      }

      toast.success("Booking modified successfully")
      onBookingUpdated()
      onClose()
      
      // Reset form
      setNewPickupDate("")
      setNewReturnDate("")
      setNewPickupLocation("")
      setNewSpecialRequests("")
    } catch (error) {
      console.error("Error modifying booking:", error)
      toast.error("Failed to modify booking")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setCancelReason("")
    setNewPickupDate(booking.pickup_date.slice(0, 16))
    setNewReturnDate(booking.return_date.slice(0, 16))
    setNewPickupLocation(booking.pickup_location)
    setNewSpecialRequests(booking.special_requests || "")
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
      setTimeout(resetForm, 300) // Reset after modal closes
    } else {
      resetForm() // Set initial values when opening
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {action === 'cancel' ? (
              <>
                <X className="h-5 w-5 text-red-500" />
                Cancel Booking
              </>
            ) : (
              <>
                <Edit className="h-5 w-5 text-blue-500" />
                Modify Booking
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {action === 'cancel' 
              ? "Are you sure you want to cancel this booking? This action cannot be undone."
              : "Update your booking details. Changes will require admin approval."
            }
          </DialogDescription>
        </DialogHeader>

        {/* Booking Summary */}
        <Card className="my-4">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <img
                src={booking.vehicles.images?.[0] || "/placeholder.jpg"}
                alt={booking.vehicles.name}
                className="w-24 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{booking.vehicles.name}</h3>
                <p className="text-sm text-gray-600">
                  {booking.vehicles.brand} {booking.vehicles.model} • {booking.vehicles.year}
                </p>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(booking.pickup_date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {booking.total_hours}h
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    ₹{booking.total_amount}
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="h-fit">
                {booking.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {action === 'cancel' ? (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Cancellation Policy</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Cancellations made at least 2 hours before pickup time are eligible for a full refund. 
                    Cancellations made less than 2 hours before pickup may incur a cancellation fee.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="cancelReason">Reason for Cancellation *</Label>
              <Textarea
                id="cancelReason"
                placeholder="Please provide a reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Modification Policy</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Modifications must be made at least 4 hours before pickup time. 
                    Price changes will be calculated automatically and require payment adjustment.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newPickupDate">New Pickup Date & Time *</Label>
                <Input
                  id="newPickupDate"
                  type="datetime-local"
                  value={newPickupDate}
                  onChange={(e) => setNewPickupDate(e.target.value)}
                  className="mt-1"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              <div>
                <Label htmlFor="newReturnDate">New Return Date & Time *</Label>
                <Input
                  id="newReturnDate"
                  type="datetime-local"
                  value={newReturnDate}
                  onChange={(e) => setNewReturnDate(e.target.value)}
                  className="mt-1"
                  min={newPickupDate}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="newPickupLocation">New Pickup Location *</Label>
              <Input
                id="newPickupLocation"
                placeholder="Enter new pickup location..."
                value={newPickupLocation}
                onChange={(e) => setNewPickupLocation(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="newSpecialRequests">Special Requests</Label>
              <Textarea
                id="newSpecialRequests"
                placeholder="Any special requests or modifications..."
                value={newSpecialRequests}
                onChange={(e) => setNewSpecialRequests(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            {newPickupDate && newReturnDate && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">Price Calculation</h4>
                <div className="text-sm text-green-700">
                  {(() => {
                    const pickupTime = new Date(newPickupDate)
                    const returnTime = new Date(newReturnDate)
                    const hours = (returnTime.getTime() - pickupTime.getTime()) / (1000 * 60 * 60)
                    const newAmount = hours * booking.vehicles.price_per_hour
                    const difference = newAmount - booking.total_amount
                    
                    return (
                      <>
                        <p>Duration: {hours.toFixed(1)} hours</p>
                        <p>Rate: ₹{booking.vehicles.price_per_hour}/hour</p>
                        <p className="font-semibold">New Total: ₹{newAmount.toFixed(2)}</p>
                        <p className={difference >= 0 ? "text-red-600" : "text-green-600"}>
                          Difference: {difference >= 0 ? '+' : ''}₹{difference.toFixed(2)}
                        </p>
                      </>
                    )
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={action === 'cancel' ? handleCancel : handleModify}
            disabled={loading}
            variant={action === 'cancel' ? "destructive" : "default"}
          >
            {loading ? "Processing..." : action === 'cancel' ? "Confirm Cancellation" : "Confirm Modification"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
