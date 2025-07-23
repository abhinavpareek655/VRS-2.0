import { NextRequest, NextResponse } from 'next/server'
import { sendBookingConfirmationEmail } from '@/lib/emailService'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing email functionality...')
    
    // Mock booking details for testing
    const testBookingDetails = {
      booking: {
        id: 'test-booking-123',
        pickup_location: 'Test Location',
        special_requests: 'Test booking email functionality'
      },
      vehicle: {
        brand: 'Test',
        name: 'Test Vehicle',
        model: 'Test Model',
        year: 2023,
        type: 'car',
        price_per_day: 150
      },
      user: {
        email: 'abhinavpareek655@gmail.com', // Using your email from env
        full_name: 'Test User'
      },
      pickupDate: new Date().toISOString(),
      returnDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      totalHours: 24,
      totalAmount: 1,
      paymentId: 'test_payment_123',
      bookingId: 'test-booking-123',
      originalAmount: 150,
      testingMode: true
    }

    console.log('📧 Sending test email...')
    const result = await sendBookingConfirmationEmail(testBookingDetails)
    
    if (result.success) {
      console.log('✅ Test email sent successfully!')
      return NextResponse.json({ 
        success: true, 
        message: 'Test email sent successfully!',
        messageId: result.messageId 
      })
    } else {
      console.log('❌ Test email failed:', result.error)
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('❌ Test email API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
