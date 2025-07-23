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
  const [scriptError, setScriptError] = useState(false)

  // Check if Razorpay is already loaded
  useEffect(() => {
    console.log('🔍 Checking Razorpay availability...')
    if (typeof window !== 'undefined' && window.Razorpay) {
      console.log('✅ Razorpay already available on window')
      setRazorpayLoaded(true)
    } else {
      console.log('⏳ Razorpay not yet available, waiting for script to load...')
    }
  }, [])

  // Testing mode calculations
  const isTestingMode = process.env.NEXT_PUBLIC_TESTING_MODE === 'true'
  const originalAmount = pricePerHour * totalHours
  const finalAmount = isTestingMode ? 1 : totalAmount

  const handlePayment = async () => {
    if (!razorpayLoaded && !window.Razorpay) {
      toast.error("Payment gateway not loaded. Please refresh the page and try again.")
      return
    }

    // If window.Razorpay is available but razorpayLoaded is false, update it
    if (!razorpayLoaded && window.Razorpay) {
      setRazorpayLoaded(true)
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
          totalAmount: finalAmount,
          userId: user.id,
          pickupLocation,
          specialRequests,
          testingMode: process.env.NEXT_PUBLIC_TESTING_MODE === 'true',
          originalAmount: totalAmount,
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
                totalAmount: finalAmount,
                pickupLocation,
                specialRequests,
                originalAmount: originalAmount,
                testingMode: isTestingMode,
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

  const handleDirectBooking = async () => {
    setProcessing(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in to make a booking")
        return
      }

      // Create booking directly without payment
      const confirmResponse = await fetch("/api/confirm-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razorpay_payment_id: `test_${Date.now()}`, // Generate test payment ID
          razorpay_order_id: `order_test_${Date.now()}`, // Generate test order ID
          razorpay_signature: `test_signature_${Date.now()}`, // Generate test signature
          vehicleId,
          userId: user.id,
          pickupDate,
          returnDate,
          totalHours: totalHours.toString(),
          totalAmount: 0, // Free booking for testing
          pickupLocation,
          specialRequests: `[DIRECT BOOKING - NO PAYMENT] ${specialRequests || ''}`,
          originalAmount: originalAmount,
          testingMode: true,
        }),
      })

      const confirmData = await confirmResponse.json()

      if (!confirmResponse.ok) {
        if (confirmData.conflictError) {
          toast.error("⚠️ Time slot was booked by someone else! Please select different dates.")
          window.location.reload()
        } else {
          throw new Error(confirmData.error || "Failed to create booking")
        }
        return
      }

      toast.success("Booking created successfully without payment!")
      onSuccess(confirmData.booking.id)
    } catch (error: any) {
      console.error("Direct booking error:", error)
      toast.error("Failed to create booking. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <>
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log('✅ Razorpay script loaded successfully')
          setRazorpayLoaded(true)
        }}
        onError={() => {
          console.error('❌ Failed to load Razorpay script')
          setScriptError(true)
        }}
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
          {/* Testing Mode Banner */}
          {process.env.NEXT_PUBLIC_TESTING_MODE === 'true' && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-green-800">🧪 Testing Mode Active</span>
              </div>
              <p className="text-sm text-green-700">
                Special pricing for testing period. All bookings are charged at ₹1 for testing purposes.
              </p>
            </div>
          )}

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
            
            {process.env.NEXT_PUBLIC_TESTING_MODE === 'true' ? (
              <>
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="line-through text-gray-500">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Testing Discount:</span>
                  <span className="text-green-600 font-medium">-₹{totalAmount - 1}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="font-semibold">Total (Testing Price):</span>
                  <span className="font-semibold text-lg text-green-600">₹1</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="font-semibold">Total:</span>
                <span className="font-semibold text-lg">₹{totalAmount}</span>
              </div>
            )}
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
              disabled={processing || (!razorpayLoaded && !window?.Razorpay)}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ₹${process.env.NEXT_PUBLIC_TESTING_MODE === 'true' ? '1' : totalAmount}`
              )}
            </Button>
          </div>

          {/* Direct Booking Button for Testing */}
          {process.env.NEXT_PUBLIC_TESTING_MODE === 'true' && (
            <div className="border-t pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleDirectBooking}
                disabled={processing}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 border-2 border-dashed border-gray-300"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Booking...
                  </>
                ) : (
                  '🧪 Book Without Payment (Testing Only)'
                )}
              </Button>
              <p className="text-xs text-gray-500 text-center mt-2">
                For testing purposes only - bypasses payment gateway
              </p>
            </div>
          )}

          {!razorpayLoaded && !window?.Razorpay && !scriptError && (
            <div className="text-center text-sm text-gray-500 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading payment gateway...
            </div>
          )}

          {scriptError && (
            <div className="text-center text-sm text-red-500">
              ⚠️ Failed to load payment gateway. Please refresh the page.
            </div>
          )}

          {(razorpayLoaded || window?.Razorpay) && (
            <div className="text-center text-sm text-green-600 flex items-center justify-center gap-2">
              ✅ Payment gateway ready
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
