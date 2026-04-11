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
    const { status, admin_response } = await request.json()

    const result = await sql`
      UPDATE tickets
      SET 
        status = COALESCE(${status}, status),
        admin_response = COALESCE(${admin_response}, admin_response),
        updated_at = NOW()
      WHERE id = ${parseInt(id)}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Get ticket user info
    const ticket = result[0]

    // Create alert for status update
    if (status || admin_response) {
      await sql`
        INSERT INTO alerts (user_id, type, title, message)
        VALUES (${ticket.user_id}, 'system', 'Ticket Updated', ${'Your support ticket "' + ticket.subject + '" has been updated.'})
      `
    }

    return NextResponse.json({ ticket: result[0] })
  } catch (error) {
    console.error('Update ticket error:', error)
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
  }
}
