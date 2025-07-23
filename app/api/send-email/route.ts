import { NextRequest, NextResponse } from 'next/server'
import { sendBookingConfirmationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { type, bookingDetails } = await request.json()

    if (!type || !bookingDetails) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let result

    switch (type) {
      case 'booking-confirmation':
        result = await sendBookingConfirmationEmail(bookingDetails)
        break
      case 'booking-cancellation':
        return NextResponse.json({ error: 'Cancellation email not supported' }, { status: 400 })
      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
    }

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        messageId: (result as { messageId?: string }).messageId,
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
