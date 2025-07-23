import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendBookingCancellationEmail } from '@/lib/emailService'

export async function POST(request: NextRequest) {
  try {
    const { bookingId, userId, reason } = await request.json()

    if (!bookingId || !userId) {
      return NextResponse.json({ error: 'Booking ID and User ID are required' }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Admin access not configured' }, { status: 500 })
    }

    // Get booking details first to verify ownership and current status
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        vehicles (*)
      `)
      .eq('id', bookingId)
      .eq('user_id', userId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found or access denied' }, { status: 404 })
    }

    // Check if booking can be cancelled
    const now = new Date()
    const pickupDate = new Date(booking.pickup_date)
    const hoursUntilPickup = (pickupDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    // Don't allow cancellation if pickup is within 2 hours
    if (hoursUntilPickup < 2) {
      return NextResponse.json({ 
        error: 'Cannot cancel booking less than 2 hours before pickup time' 
      }, { status: 400 })
    }

    // Don't allow cancellation of already cancelled or completed bookings
    if (['cancelled', 'completed'].includes(booking.status)) {
      return NextResponse.json({ 
        error: `Cannot cancel a ${booking.status} booking` 
      }, { status: 400 })
    }

    // Update booking status to cancelled
    const { data: updatedBooking, error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({
        status: 'cancelled',
        special_requests: booking.special_requests ? 
          `${booking.special_requests}\n[CANCELLED: ${reason || 'No reason provided'}]` : 
          `[CANCELLED: ${reason || 'No reason provided'}]`,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating booking:', updateError)
      return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 })
    }

    // Get user details for email
    const { data: user } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // Send cancellation email if user email exists
    if (user?.email) {
      try {
        await sendBookingCancellationEmail({
          booking: updatedBooking,
          vehicle: booking.vehicles,
          user,
          reason: reason || 'No reason provided',
          refundInfo: getRefundInfo(hoursUntilPickup, booking.total_amount)
        })
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError)
        // Don't fail the cancellation if email fails
      }
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: 'Booking cancelled successfully',
      refundInfo: getRefundInfo(hoursUntilPickup, booking.total_amount)
    })

  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getRefundInfo(hoursUntilPickup: number, totalAmount: number) {
  let refundPercentage = 100
  let refundAmount = totalAmount

  // Refund policy based on cancellation time
  if (hoursUntilPickup < 24) {
    refundPercentage = 50 // 50% refund if cancelled within 24 hours
    refundAmount = totalAmount * 0.5
  } else if (hoursUntilPickup < 48) {
    refundPercentage = 75 // 75% refund if cancelled within 48 hours
    refundAmount = totalAmount * 0.75
  }
  // 100% refund if cancelled more than 48 hours in advance

  return {
    refundPercentage,
    refundAmount: Math.round(refundAmount * 100) / 100,
    processingTime: '3-5 business days'
  }
}
