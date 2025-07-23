import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { sendBookingConfirmationEmail } from '@/lib/emailService'

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
      specialRequests,
      originalAmount,
      testingMode
    } = await request.json()

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification data is required' }, { status: 400 })
    }

    // Skip payment verification for direct test bookings
    const isDirectBooking = razorpay_payment_id.startsWith('test_')
    
    if (!isDirectBooking) {
      // Verify payment signature for real payments
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
    } else {
      console.log('Direct booking detected, skipping payment verification...')
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

    // Create booking in database - try with total_hours first, fallback without it
    const bookingSpecialRequests = testingMode 
      ? `[TESTING MODE - Original Amount: ₹${originalAmount}] ${specialRequests || ''}`
      : specialRequests || null;

    let bookingData = {
      user_id: userId,
      vehicle_id: vehicleId,
      pickup_location: pickupLocation,
      pickup_date: pickupDate,
      return_date: returnDate,
      total_days: Math.ceil(parseInt(totalHours) / 24), // Convert hours to days for storage
      total_amount: totalAmount,
      status: 'confirmed', // Direct confirmation after payment
      payment_status: isDirectBooking ? 'pending' : 'paid', // Use 'pending' for direct bookings since no actual payment was made
      payment_id: razorpay_payment_id,
      special_requests: bookingSpecialRequests,
    }

    // Check if we have admin client available
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Admin access not configured' }, { status: 500 })
    }

    // Try to insert with total_hours column using admin client to bypass RLS
    let { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        ...bookingData,
        total_hours: parseInt(totalHours),
      })
      .select()
      .single()

    // If total_hours column doesn't exist, try without it
    if (bookingError && bookingError.message.includes('total_hours')) {
      console.log('total_hours column not found, inserting without it...')
      const result = await supabaseAdmin
        .from('bookings')
        .insert(bookingData)
        .select()
        .single()
      
      booking = result.data
      bookingError = result.error
    }

    if (bookingError) {
      console.error('Error creating booking:', bookingError)
      return NextResponse.json({ 
        error: 'Failed to create booking after payment. Please contact support with payment ID: ' + razorpay_payment_id,
        paymentId: razorpay_payment_id 
      }, { status: 500 })
    }

    // Get vehicle details for email
    const { data: vehicle, error: vehicleError } = await supabaseAdmin
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .single()

    // Get user details for email - try profiles table first, then users
    let { data: user, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // If profiles table doesn't work, try users table
    if (userError && userError.message.includes('relation "profiles" does not exist')) {
      const result = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      user = result.data
      userError = result.error
    }

    // Send booking confirmation email
    if (!userError && !vehicleError && user?.email) {
      try {
        const emailResult = await sendBookingConfirmationEmail({
          booking,
          vehicle,
          user,
          pickupDate,
          returnDate,
          totalHours,
          totalAmount,
          paymentId: razorpay_payment_id,
          bookingId: booking.id,
          originalAmount: originalAmount || totalAmount,
          testingMode: testingMode || false
        })
        
        if (emailResult.success) {
          console.log('Booking confirmation email sent successfully')
        } else {
          console.error('Failed to send booking confirmation email:', emailResult.error)
        }
      } catch (emailError) {
        console.error('Error sending booking confirmation email:', emailError)
        // Don't fail the booking if email fails
      }
    }

    return NextResponse.json({
      success: true,
      booking,
      message: 'Booking confirmed successfully! Confirmation email has been sent.',
    })
  } catch (error) {
    console.error('Error confirming booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}