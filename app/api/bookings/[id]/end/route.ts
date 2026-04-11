import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    // Get booking
    const bookings = await sql`
      SELECT b.*, s.hourly_rate, s.slot_number
      FROM bookings b
      JOIN slots s ON b.slot_id = s.id
      WHERE b.id = ${parseInt(id)}
    `

    if (bookings.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const booking = bookings[0]

    // Check authorization
    if (booking.user_id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (booking.status !== 'active') {
      return NextResponse.json({ error: 'Booking is not active' }, { status: 400 })
    }

    // Calculate cost
    const startTime = new Date(booking.start_time)
    const endTime = new Date()
    const hours = Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60))
    const totalCost = hours * Number(booking.hourly_rate)

    // Check if user has enough credits
    if (Number(user.credits) < totalCost) {
      return NextResponse.json({ error: 'Insufficient credits to end booking' }, { status: 400 })
    }

    // Deduct credits
    const newBalance = Number(user.credits) - totalCost
    await sql`UPDATE users SET credits = ${newBalance}, updated_at = NOW() WHERE id = ${user.id}`

    // Update booking
    await sql`
      UPDATE bookings 
      SET end_time = NOW(), status = 'completed', total_cost = ${totalCost}, updated_at = NOW()
      WHERE id = ${parseInt(id)}
    `

    // Update slot status
    await sql`UPDATE slots SET status = 'available' WHERE id = ${booking.slot_id}`

    // Create transaction record
    await sql`
      INSERT INTO transactions (user_id, booking_id, type, amount, balance_after, description)
      VALUES (${user.id}, ${parseInt(id)}, 'payment', ${-totalCost}, ${newBalance}, ${'Parking payment for slot ' + booking.slot_number + ' (' + hours + ' hours)'})
    `

    // Check for low balance and create alert
    if (newBalance < 10) {
      await sql`
        INSERT INTO alerts (user_id, type, title, message)
        VALUES (${user.id}, 'low_balance', 'Low Balance Warning', 'Your balance is below $10. Please top up to continue using parking services.')
      `
    }

    return NextResponse.json({ 
      success: true, 
      totalCost, 
      hours, 
      newBalance 
    })
  } catch (error) {
    console.error('End booking error:', error)
    return NextResponse.json({ error: 'Failed to end booking' }, { status: 500 })
  }
}
