import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const search = searchParams.get('search')

    let users
    if (search) {
      const searchPattern = `%${search}%`
      users = await sql`
        SELECT id, name, email, role, credits, vehicle_number, phone, created_at
        FROM users 
        WHERE name ILIKE ${searchPattern} OR email ILIKE ${searchPattern}
        ORDER BY created_at DESC
      `
    } else if (role) {
      users = await sql`
        SELECT id, name, email, role, credits, vehicle_number, phone, created_at
        FROM users WHERE role = ${role}
        ORDER BY created_at DESC
      `
    } else {
      users = await sql`
        SELECT id, name, email, role, credits, vehicle_number, phone, created_at
        FROM users
        ORDER BY created_at DESC
      `
    }

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
