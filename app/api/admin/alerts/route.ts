import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  try {
    await requireAdmin()

    const alerts = await sql`
      SELECT a.*, u.name AS user_name, u.email AS user_email
      FROM alerts a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 20
    `

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error('Admin alerts error:', error)
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}
