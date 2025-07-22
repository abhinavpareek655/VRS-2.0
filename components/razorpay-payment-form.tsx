"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CreditCard, Lock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import Script from "next/script"

// Declare Razorpay type for TypeScript
declare global {
  interface Window {
    Razorpay: any
  }
}

interface RazorpayPaymentFormProps {
  vehicleId: string
  vehicleName: string
  pricePerHour: number
  pickupDate: string
  returnDate: string
  pickupLocation: string
  specialRequests: string
  totalHours: number
  totalAmount: number
  onSuccess: (bookingId: string) => void
  onCancel: () => void
}

export function RazorpayPaymentForm({
  vehicleId,
  vehicleName,
  pricePerHour,
  pickupDate,
  returnDate,
  pickupLocation,
  specialRequests,
  totalHours,
  totalAmount,
  onSuccess,
  onCancel,
}: RazorpayPaymentFormProps) {
  const [processing, setProcessing] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      toast.error("Payment gateway not loaded. Please refresh the page and try again.")
      return
    }

    setProcessing(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in to make a booking")
        return
      }

      // Create Razorpay order
      const orderResponse = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleId,
          pickupDate,
          returnDate,
          totalAmount,
          userId: user.id,
          pickupLocation,
          specialRequests,
        }),
      })

      const orderData = await orderResponse.json()

      if (!orderResponse.ok) {
        throw new Error(orderData.error || "Failed to create payment order")
      }

      // Initialize Razorpay payment
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Vehicle Rental System",
        description: `Booking for ${vehicleName} (${totalHours} hours)`,
        image: "/RentWheels-logo.png",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // Confirm booking after successful payment
            const confirmResponse = await fetch("/api/confirm-booking", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                vehicleId,
                userId: user.id,
                pickupDate,
                returnDate,
                totalHours: totalHours.toString(),
                totalAmount,
                pickupLocation,
                specialRequests,
              }),
            })

            const confirmData = await confirmResponse.json()

            if (!confirmResponse.ok) {
              if (confirmData.conflictError) {
                // Handle first-come-first-serve scenario
                toast.error("⚠️ Time slot was booked by someone else during payment! Please select different dates. Your payment will be refunded in 3-5 business days.")
                window.location.reload() // Refresh to show updated availability
              } else {
                throw new Error(confirmData.error || "Failed to confirm booking")
              }
              return
            }

            toast.success("Booking confirmed successfully!")
            onSuccess(confirmData.booking.id)
          } catch (error: any) {
            console.error("Booking confirmation error:", error)
            toast.error("Payment successful but booking confirmation failed. Please contact support.")
          } finally {
            setProcessing(false)
          }
        },
        prefill: {
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || "Customer",
          email: user.email || "",
          contact: user.user_metadata?.phone || "",
        },
        notes: {
          vehicle_id: vehicleId,
          pickup_location: pickupLocation,
          pickup_date: pickupDate,
          return_date: returnDate,
        },
        theme: {
          color: "#EAB308", // Yellow-500 to match your theme
        },
        modal: {
          ondismiss: function() {
            console.log("Payment modal dismissed")
            setProcessing(false)
          }
        }
      }

      const rzp = new window.Razorpay(options)
      
      rzp.on('payment.failed', function (response: any) {
        console.error("Payment failed:", response.error)
        toast.error(`Payment failed: ${response.error.description || 'Unknown error'}`)
        setProcessing(false)
      })

      rzp.open()
    } catch (error: any) {
      console.error("Payment initialization error:", error)
      toast.error(error.message || "Failed to initialize payment. Please try again.")
      setProcessing(false)
    }
  }

  return (
    <>
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js" 
        strategy="afterInteractive"
        onLoad={() => setRazorpayLoaded(true)}
      />
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Details
          </CardTitle>
          <CardDescription>
            Complete your booking for {vehicleName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Booking Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Vehicle:</span>
              <span className="font-medium">{vehicleName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Duration:</span>
              <span className="font-medium">{totalHours} hours</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Rate:</span>
              <span className="font-medium">₹{pricePerHour}/hour</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="font-semibold">Total:</span>
              <span className="font-semibold text-lg">₹{totalAmount}</span>
            </div>
          </div>

          {/* Payment Method Info */}
          <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
            <img 
              src="https://d6xcmfyh68wv8.cloudfront.net/newsroom-content/uploads/2024/05/Razorpay-Logo.jpg" 
              alt="Razorpay" 
              className="h-8 w-12 object-contain" 
            />
            <div className="text-sm">
              <p className="font-medium text-blue-900">Secure Payment via Razorpay</p>
              <p className="text-blue-700">UPI, Cards, Net Banking & Wallets</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Lock className="h-4 w-4" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={processing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={processing || !razorpayLoaded}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ₹${totalAmount}`
              )}
            </Button>
          </div>

          {!razorpayLoaded && (
            <div className="text-center text-sm text-gray-500">
              Loading payment gateway...
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
