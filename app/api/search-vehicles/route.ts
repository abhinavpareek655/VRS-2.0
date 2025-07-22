import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pickupDate = searchParams.get('pickup')
    const returnDate = searchParams.get('return')
    const location = searchParams.get('location')

    if (!pickupDate || !returnDate) {
      return NextResponse.json({ error: 'Pickup and return dates are required' }, { status: 400 })
    }

    // Get all vehicles with their categories
    let query = supabase
      .from('vehicles')
      .select(`
        *,
        vehicle_categories (
          name,
          icon
        )
      `)
      .eq('available', true)

    // Add location filter if provided
    if (location) {
      query = query.ilike('location', `%${location}%`)
    }

    const { data: vehicles, error: vehiclesError } = await query

    if (vehiclesError) {
      console.error('Error fetching vehicles:', vehiclesError)
      return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 })
    }

    // Get all bookings that might conflict with the requested dates
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('vehicle_id, pickup_date, return_date')
      .in('status', ['pending', 'confirmed', 'active'])

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError)
      return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 })
    }

    // Filter out vehicles that are booked during the requested period
    const requestedStart = new Date(pickupDate)
    const requestedEnd = new Date(returnDate)

    interface VehicleCategory {
      name: string
      icon: string
    }

    interface Vehicle {
      id: number
      available: boolean
      location: string
      vehicle_categories: VehicleCategory
      [key: string]: any
    }

    interface Booking {
      vehicle_id: number
      pickup_date: string
      return_date: string
      [key: string]: any
    }

    const availableVehicles = (vehicles as Vehicle[]).filter((vehicle: Vehicle) => {
      const vehicleBookings = (bookings as Booking[]).filter((booking: Booking) => booking.vehicle_id === vehicle.id)
      
      return !vehicleBookings.some((booking: Booking) => {
        const bookingStart = new Date(booking.pickup_date)
        const bookingEnd = new Date(booking.return_date)
        
        // Check if there's any overlap
        return (
          (requestedStart >= bookingStart && requestedStart < bookingEnd) ||
          (requestedEnd > bookingStart && requestedEnd <= bookingEnd) ||
          (requestedStart <= bookingStart && requestedEnd >= bookingEnd)
        )
      })
    })

    return NextResponse.json({ vehicles: availableVehicles })
  } catch (error) {
    console.error('Error searching vehicles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}