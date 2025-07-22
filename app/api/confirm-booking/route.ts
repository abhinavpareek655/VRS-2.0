import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      vehicleId,
      userId,
      pickupDate,
      returnDate,
      totalHours,
      totalAmount,
      pickupLocation,
      specialRequests
    } = await request.json()

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification data is required' }, { status: 400 })
    }

    // Verify payment signature
    const key_secret = process.env.RAZORPAY_KEY_SECRET
    if (!key_secret) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
    }

    // Import crypto for signature verification
    const crypto = await import('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    // FIRST-COME-FIRST-SERVE: Check availability again before creating booking
    const { data: existingBookings, error: checkError } = await supabase
      .from('bookings')
      .select('pickup_date, return_date')
      .eq('vehicle_id', vehicleId)
      .in('status', ['pending', 'confirmed', 'active'])

    if (checkError) {
      return NextResponse.json({ error: 'Failed to verify availability' }, { status: 500 })
    }

    // Check for conflicts with existing bookings
    const requestStart = new Date(pickupDate)
    const requestEnd = new Date(returnDate)

    const hasConflict = existingBookings.some(booking => {
      const existingStart = new Date(booking.pickup_date)
      const existingEnd = new Date(booking.return_date)
      
      return (
        (requestStart >= existingStart && requestStart < existingEnd) ||
        (requestEnd > existingStart && requestEnd <= existingEnd) ||
        (requestStart <= existingStart && requestEnd >= existingEnd)
      )
    })

    if (hasConflict) {
      // Someone else booked this slot first - payment was successful but booking failed
      return NextResponse.json({ 
        error: 'This time slot was booked by someone else while you were making payment. Please select different dates and your payment will be refunded within 3-5 business days.',
        conflictError: true,
        paymentId: razorpay_payment_id
      }, { status: 409 })
    }

    // Create booking in database
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: userId,
        vehicle_id: vehicleId,
        pickup_location: pickupLocation,
        pickup_date: pickupDate,
        return_date: returnDate,
        total_days: Math.ceil(parseInt(totalHours) / 24), // Convert hours to days for storage
        total_hours: parseInt(totalHours),
        total_amount: totalAmount,
        status: 'confirmed', // Direct confirmation after payment
        payment_status: 'paid',
        payment_id: razorpay_payment_id,
        special_requests: specialRequests || null,
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Error creating booking:', bookingError)
      return NextResponse.json({ 
        error: 'Failed to create booking after payment. Please contact support with payment ID: ' + razorpay_payment_id,
        paymentId: razorpay_payment_id 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      booking,
      message: 'Booking confirmed successfully!',
    })
  } catch (error) {
    console.error('Error confirming booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}