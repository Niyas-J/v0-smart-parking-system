import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    const user = await requireAuth()

    const alerts = await sql`
      SELECT * FROM alerts 
      WHERE user_id = ${user.id} 
      ORDER BY created_at DESC
      LIMIT 50
    `

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error('Get alerts error:', error)
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { alertIds } = await request.json()

    if (alertIds && alertIds.length > 0) {
      await sql`
        UPDATE alerts SET is_read = true 
        WHERE user_id = ${user.id} AND id = ANY(${alertIds}::int[])
      `
    } else {
      await sql`UPDATE alerts SET is_read = true WHERE user_id = ${user.id}`
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mark alerts read error:', error)
    return NextResponse.json({ error: 'Failed to mark alerts as read' }, { status: 500 })
  }
}
