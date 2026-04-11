import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSession, requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const floor = searchParams.get('floor')
    const status = searchParams.get('status')

    let slots
    if (floor && status) {
      slots = await sql`SELECT * FROM slots WHERE floor = ${parseInt(floor)} AND status = ${status} ORDER BY slot_number`
    } else if (floor) {
      slots = await sql`SELECT * FROM slots WHERE floor = ${parseInt(floor)} ORDER BY slot_number`
    } else if (status) {
      slots = await sql`SELECT * FROM slots WHERE status = ${status} ORDER BY slot_number`
    } else {
      slots = await sql`SELECT * FROM slots ORDER BY floor, slot_number`
    }

    return NextResponse.json({ slots })
  } catch (error) {
    console.error('Get slots error:', error)
    return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const { slot_number, floor, slot_type, hourly_rate } = await request.json()

    if (!slot_number) {
      return NextResponse.json({ error: 'Slot number is required' }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO slots (slot_number, floor, slot_type, hourly_rate)
      VALUES (${slot_number}, ${floor || 1}, ${slot_type || 'standard'}, ${hourly_rate || 2.00})
      RETURNING *
    `

    return NextResponse.json({ slot: result[0] })
  } catch (error) {
    console.error('Create slot error:', error)
    return NextResponse.json({ error: 'Failed to create slot' }, { status: 500 })
  }
}
