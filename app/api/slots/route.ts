import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import type { Slot } from '@/lib/db'
import { getSession, requireAdmin } from '@/lib/auth'
import { enrichSlot, enrichSlots, type ParkingZone } from '@/lib/slot-zone'

export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const floor = searchParams.get('floor')
    const status = searchParams.get('status')
    const zone = searchParams.get('zone') as ParkingZone | null

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

    let list = enrichSlots(slots as Slot[])
    if (zone && (zone === 'bike' || zone === 'car' || zone === 'suv')) {
      list = list.filter((s) => s.zone === zone)
    }

    return NextResponse.json({ slots: list })
  } catch (error) {
    console.error('Get slots error:', error)
    return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const { slot_number, floor, slot_type, hourly_rate, zone } = await request.json()

    if (!slot_number) {
      return NextResponse.json({ error: 'Slot number is required' }, { status: 400 })
    }

    const z = zone === 'bike' || zone === 'car' || zone === 'suv' ? zone : 'car'

    const result = await sql`
      INSERT INTO slots (slot_number, floor, slot_type, hourly_rate, status)
      VALUES (${slot_number}, ${floor || 1}, ${slot_type || 'standard'}, ${hourly_rate || 2.00}, 'available')
      RETURNING *
    `

    let row = result[0] as Slot
    try {
      const updated = await sql`UPDATE slots SET zone = ${z} WHERE id = ${row.id} RETURNING *`
      if (updated[0]) row = updated[0] as Slot
    } catch {
      /* zone column may not exist until migration */
    }

    return NextResponse.json({ slot: enrichSlot(row) })
  } catch (error) {
    console.error('Create slot error:', error)
    return NextResponse.json({ error: 'Failed to create slot' }, { status: 500 })
  }
}
