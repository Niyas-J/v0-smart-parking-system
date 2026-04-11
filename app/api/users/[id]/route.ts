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
    const { credits, role, vehicle_number, phone } = await request.json()

    const result = await sql`
      UPDATE users
      SET 
        credits = COALESCE(${credits}, credits),
        role = COALESCE(${role}, role),
        vehicle_number = COALESCE(${vehicle_number}, vehicle_number),
        phone = COALESCE(${phone}, phone),
        updated_at = NOW()
      WHERE id = ${parseInt(id)}
      RETURNING id, name, email, role, credits, vehicle_number, phone, created_at
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user: result[0] })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
