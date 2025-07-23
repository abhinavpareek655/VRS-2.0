import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { vehicleId, pickupDate, returnDate, totalAmount, userId, pickupLocation, specialRequests, testingMode, originalAmount } = await request.json()

    // Validate input
    if (!vehicleId || !pickupDate || !returnDate || !totalAmount || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Calculate total hours
    const start = new Date(pickupDate)
    const end = new Date(returnDate)
    const totalHours = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60)))

    // Check vehicle availability
    const { data: existingBookings, error: bookingError } = await supabase
      .from('bookings')
      .select('pickup_date, return_date')
      .eq('vehicle_id', vehicleId)
      .in('status', ['pending', 'confirmed', 'active'])

    if (bookingError) {
      return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 })
    }

    // Check for conflicts
    for (const booking of existingBookings) {
      const existingStart = new Date(booking.pickup_date)
      const existingEnd = new Date(booking.return_date)
      
      if (
        (start >= existingStart && start < existingEnd) ||
        (end > existingStart && end <= existingEnd) ||
        (start <= existingStart && end >= existingEnd)
      ) {
        return NextResponse.json({ error: 'Vehicle is not available for the selected dates' }, { status: 409 })
      }
    }

    // Get vehicle details
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('name, price_per_day')
      .eq('id', vehicleId)
      .single()

    if (vehicleError || !vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // Use environment variables for Razorpay keys
    const key_id = process.env.RAZORPAY_KEY_ID
    const key_secret = process.env.RAZORPAY_KEY_SECRET

    if (!key_id || !key_secret) {
      console.error('Razorpay keys not configured')
      return NextResponse.json({ 
        error: 'Payment gateway not configured. Please contact support.' 
      }, { status: 500 })
    }

    // Import Razorpay dynamically
    let Razorpay: any
    try {
      const razorpayModule = await import('razorpay')
      Razorpay = razorpayModule.default
    } catch (importError) {
      console.error('Failed to import Razorpay:', importError)
      return NextResponse.json({ 
        error: 'Payment gateway not available' 
      }, { status: 500 })
    }

    const razorpay = new Razorpay({ 
      key_id, 
      key_secret 
    })

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // Convert to paise
      currency: 'INR',
      payment_capture: 1,
      notes: {
        vehicleId,
        userId,
        pickupDate,
        returnDate,
        totalHours: totalHours.toString(),
        pickupLocation,
        specialRequests: specialRequests || '',
        vehicleName: vehicle.name,
        source: 'vehicle-rental-system',
        testingMode: testingMode ? 'true' : 'false',
        originalAmount: originalAmount ? originalAmount.toString() : totalAmount.toString()
      }
    })

    console.log('Razorpay order created:', order.id)
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: key_id
    })
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error)
    
    if (error.error) {
      // Razorpay specific error
      return NextResponse.json({ 
        error: error.error.description || error.error.reason || 'Payment gateway error' 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: 'Failed to create payment order. Please try again.' 
    }, { status: 500 })
  }
}
