import { NextRequest, NextResponse } from 'next/server'
import { sendBookingConfirmationEmail, sendBookingCancellationEmail, sendBookingModificationEmail } from '@/lib/emailService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type } = body

    if (!type) {
      return NextResponse.json({ error: 'Missing email type' }, { status: 400 })
    }

    let result

    switch (type) {
      case 'booking_confirmation':
        result = await sendBookingConfirmationEmail(body.bookingDetails)
        break
      case 'booking_cancelled':
        result = await sendBookingCancellationEmail({
          bookingId: body.bookingId,
          vehicleName: body.vehicleName,
          pickupDate: body.pickupDate,
          reason: body.reason,
          amount: body.amount
        })
        break
      case 'booking_modified':
        result = await sendBookingModificationEmail({
          bookingId: body.bookingId,
          vehicleName: body.vehicleName,
          oldPickupDate: body.oldPickupDate,
          newPickupDate: body.newPickupDate,
          oldAmount: body.oldAmount,
          newAmount: body.newAmount
        })
        break
      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
    }

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        messageId: result.messageId,
        message: 'Email sent successfully'
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in email API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
