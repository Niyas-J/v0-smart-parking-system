import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const updates = await request.json()

    const { slot_number, floor, slot_type, status, hourly_rate } = updates

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

    return NextResponse.json({ slot: result[0] })
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
