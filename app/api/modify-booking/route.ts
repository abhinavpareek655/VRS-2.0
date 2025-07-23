import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendBookingModificationEmail } from '@/lib/emailService'

export async function POST(request: NextRequest) {
  try {
    const { 
      bookingId, 
      userId, 
      pickupDate, 
      returnDate, 
      pickupLocation, 
      specialRequests 
    } = await request.json()

    if (!bookingId || !userId) {
      return NextResponse.json({ error: 'Booking ID and User ID are required' }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Admin access not configured' }, { status: 500 })
    }

    // Get current booking details
    const { data: currentBooking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        vehicles (*)
      `)
      .eq('id', bookingId)
      .eq('user_id', userId)
      .single()

    if (bookingError || !currentBooking) {
      return NextResponse.json({ error: 'Booking not found or access denied' }, { status: 404 })
    }

    // Check if booking can be modified
    const now = new Date()
    const currentPickupDate = new Date(currentBooking.pickup_date)
    const hoursUntilPickup = (currentPickupDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    // Don't allow modification if pickup is within 4 hours
    if (hoursUntilPickup < 4) {
      return NextResponse.json({ 
        error: 'Cannot modify booking less than 4 hours before pickup time' 
      }, { status: 400 })
    }

    // Don't allow modification of cancelled or completed bookings
    if (['cancelled', 'completed'].includes(currentBooking.status)) {
      return NextResponse.json({ 
        error: `Cannot modify a ${currentBooking.status} booking` 
      }, { status: 400 })
    }

    // Validate new dates if provided
    if (pickupDate && returnDate) {
      const newPickupDate = new Date(pickupDate)
      const newReturnDate = new Date(returnDate)
      
      // Check minimum 3-hour duration
      const hoursDifference = (newReturnDate.getTime() - newPickupDate.getTime()) / (1000 * 60 * 60)
      if (hoursDifference < 3) {
        return NextResponse.json({ 
          error: 'Booking duration must be at least 3 hours' 
        }, { status: 400 })
      }

      // Check if new dates conflict with existing bookings
      const { data: conflictingBookings, error: conflictError } = await supabaseAdmin
        .from('bookings')
        .select('pickup_date, return_date')
        .eq('vehicle_id', currentBooking.vehicle_id)
        .neq('id', bookingId) // Exclude current booking
        .in('status', ['pending', 'confirmed', 'active'])

      if (conflictError) {
        return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 })
      }

      const hasConflict = conflictingBookings.some(booking => {
        const existingStart = new Date(booking.pickup_date)
        const existingEnd = new Date(booking.return_date)
        
        return (
          (newPickupDate >= existingStart && newPickupDate < existingEnd) ||
          (newReturnDate > existingStart && newReturnDate <= existingEnd) ||
          (newPickupDate <= existingStart && newReturnDate >= existingEnd)
        )
      })

      if (hasConflict) {
        return NextResponse.json({ 
          error: 'Selected time slot conflicts with existing bookings' 
        }, { status: 409 })
      }
    }

    // Calculate new total amount if dates changed
    let newTotalAmount = currentBooking.total_amount
    let newTotalHours = currentBooking.total_hours

    if (pickupDate && returnDate) {
      const newPickupDateTime = new Date(pickupDate)
      const newReturnDateTime = new Date(returnDate)
      newTotalHours = Math.ceil((newReturnDateTime.getTime() - newPickupDateTime.getTime()) / (1000 * 60 * 60))
      
      // Get vehicle price per hour
      const vehiclePricePerHour = currentBooking.vehicles?.price_per_hour || 0
      newTotalAmount = vehiclePricePerHour * newTotalHours
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (pickupDate) updateData.pickup_date = pickupDate
    if (returnDate) updateData.return_date = returnDate
    if (pickupLocation) updateData.pickup_location = pickupLocation
    if (specialRequests !== undefined) updateData.special_requests = specialRequests
    if (pickupDate && returnDate) {
      updateData.total_amount = newTotalAmount
      updateData.total_hours = newTotalHours
      updateData.total_days = Math.ceil(newTotalHours / 24)
    }

    // Update booking
    const { data: updatedBooking, error: updateError } = await supabaseAdmin
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)
      .select(`
        *,
        vehicles (*)
      `)
      .single()

    if (updateError) {
      console.error('Error updating booking:', updateError)
      return NextResponse.json({ error: 'Failed to modify booking' }, { status: 500 })
    }

    // Get user details for email
    const { data: user } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // Send modification email if user email exists
    if (user?.email) {
      try {
        await sendBookingModificationEmail({
          originalBooking: currentBooking,
          updatedBooking,
          vehicle: currentBooking.vehicles,
          user,
          changes: {
            pickupDate: pickupDate !== currentBooking.pickup_date,
            returnDate: returnDate !== currentBooking.return_date,
            pickupLocation: pickupLocation !== currentBooking.pickup_location,
            specialRequests: specialRequests !== currentBooking.special_requests,
            totalAmount: newTotalAmount !== currentBooking.total_amount
          }
        })
      } catch (emailError) {
        console.error('Failed to send modification email:', emailError)
        // Don't fail the modification if email fails
      }
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: 'Booking modified successfully',
      amountDifference: newTotalAmount - currentBooking.total_amount
    })

  } catch (error) {
    console.error('Error modifying booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
