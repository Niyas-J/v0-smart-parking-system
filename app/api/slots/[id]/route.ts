import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import type { Slot } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { enrichSlot } from '@/lib/slot-zone'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const updates = await request.json()

    const { slot_number, floor, slot_type, status, hourly_rate, zone } = updates
    const zonePatch =
      zone === 'bike' || zone === 'car' || zone === 'suv' ? zone : null

    const result = await sql`
      UPDATE slots
      SET 
        slot_number = COALESCE(${slot_number}, slot_number),
        floor = COALESCE(${floor}, floor),
        slot_type = COALESCE(${slot_type}, slot_type),
        status = COALESCE(${status}, status),
        hourly_rate = COALESCE(${hourly_rate}, hourly_rate)
      WHERE id = ${parseInt(id)}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
    }

    if (zonePatch) {
      try {
        await sql`UPDATE slots SET zone = ${zonePatch} WHERE id = ${parseInt(id)}`
      } catch {
        /* zone column may not exist until migration */
      }
    }

    const refreshed = await sql`SELECT * FROM slots WHERE id = ${parseInt(id)}`
    return NextResponse.json({ slot: enrichSlot(refreshed[0] as Slot) })
  } catch (error) {
    console.error('Update slot error:', error)
    return NextResponse.json({ error: 'Failed to update slot' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    await sql`DELETE FROM slots WHERE id = ${parseInt(id)}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete slot error:', error)
    return NextResponse.json({ error: 'Failed to delete slot' }, { status: 500 })
  }
}
