import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSession, requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const all = searchParams.get('all') === 'true'

    let bookings
    if (user.role === 'admin' && all) {
      if (status) {
        bookings = await sql`
          SELECT b.*, s.slot_number, s.slot_type, s.hourly_rate, s.floor, u.name as user_name, u.email as user_email
          FROM bookings b
          JOIN slots s ON b.slot_id = s.id
          JOIN users u ON b.user_id = u.id
          WHERE b.status = ${status}
          ORDER BY b.created_at DESC
        `
      } else {
        bookings = await sql`
          SELECT b.*, s.slot_number, s.slot_type, s.hourly_rate, s.floor, u.name as user_name, u.email as user_email
          FROM bookings b
          JOIN slots s ON b.slot_id = s.id
          JOIN users u ON b.user_id = u.id
          ORDER BY b.created_at DESC
        `
      }
    } else {
      if (status) {
        bookings = await sql`
          SELECT b.*, s.slot_number, s.slot_type, s.hourly_rate, s.floor
          FROM bookings b
          JOIN slots s ON b.slot_id = s.id
          WHERE b.user_id = ${user.id} AND b.status = ${status}
          ORDER BY b.created_at DESC
        `
      } else {
        bookings = await sql`
          SELECT b.*, s.slot_number, s.slot_type, s.hourly_rate, s.floor
          FROM bookings b
          JOIN slots s ON b.slot_id = s.id
          WHERE b.user_id = ${user.id}
          ORDER BY b.created_at DESC
        `
      }
    }

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { slot_id, vehicle_number } = await request.json()

    if (!slot_id) {
      return NextResponse.json({ error: 'Slot ID is required' }, { status: 400 })
    }

    // Check if slot is available
    const slots = await sql`SELECT * FROM slots WHERE id = ${slot_id}`
    if (slots.length === 0) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
    }

    const slot = slots[0]
    if (slot.status !== 'available') {
      return NextResponse.json({ error: 'Slot is not available' }, { status: 400 })
    }

    // Check if user has enough credits (minimum 1 hour)
    if (Number(user.credits) < Number(slot.hourly_rate)) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 })
    }

    // Check if user already has an active booking
    const activeBookings = await sql`
      SELECT * FROM bookings WHERE user_id = ${user.id} AND status = 'active'
    `
    if (activeBookings.length > 0) {
      return NextResponse.json({ error: 'You already have an active booking' }, { status: 400 })
    }

    // Create booking
    const vehicleNum = vehicle_number || user.vehicle_number || 'Unknown'
    const result = await sql`
      INSERT INTO bookings (user_id, slot_id, vehicle_number, start_time, status)
      VALUES (${user.id}, ${slot_id}, ${vehicleNum}, NOW(), 'active')
      RETURNING *
    `

    // Update slot status
    await sql`UPDATE slots SET status = 'occupied' WHERE id = ${slot_id}`

    // Create alert for booking confirmation
    await sql`
      INSERT INTO alerts (user_id, type, title, message)
      VALUES (${user.id}, 'booking_reminder', 'Booking Confirmed', ${'Your parking at slot ' + slot.slot_number + ' has started.'})
    `

    return NextResponse.json({ booking: result[0] })
  } catch (error) {
    console.error('Create booking error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
