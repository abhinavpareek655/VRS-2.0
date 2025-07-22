import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('vehicleId')
    
    if (!vehicleId) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 })
    }

    // Get booked dates for the specific vehicle
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('pickup_date, return_date')
      .eq('vehicle_id', vehicleId)
      .in('status', ['pending', 'confirmed', 'active'])

    if (error) {
      console.error('Error fetching bookings:', error)
      return NextResponse.json({ error: 'Failed to fetch booking data' }, { status: 500 })
    }

    // Format the booked date ranges
    interface Booking {
        pickup_date: string
        return_date: string
    }

    interface BookedDate {
        start: string
        end: string
    }

    const bookedDates: BookedDate[] = (bookings as Booking[]).map((booking: Booking) => ({
        start: booking.pickup_date,
        end: booking.return_date,
    }))

    return NextResponse.json({ bookedDates })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}