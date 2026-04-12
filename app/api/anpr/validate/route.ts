import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    
    const { plate } = await request.json()

    if (!plate) {
      return NextResponse.json({ error: 'Plate number required' }, { status: 400 })
    }

    const cleanPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '')

    const users = await sql`
      SELECT id, name, email, credits, vehicle_number, role
      FROM users
      WHERE UPPER(REPLACE(vehicle_number, '-', '')) = ${cleanPlate}
      OR UPPER(REPLACE(vehicle_number, ' ', '')) = ${cleanPlate}
      OR UPPER(vehicle_number) = ${plate.toUpperCase()}
    `

    if (users.length === 0) {
      return NextResponse.json({
        valid: false,
        message: 'Vehicle not registered',
        plate: plate.toUpperCase()
      })
    }

    const user = users[0]

    if (Number(user.credits) < 5) {
      return NextResponse.json({
        valid: false,
        message: 'Insufficient balance',
        user: {
          name: user.name,
          email: user.email,
          credits: user.credits,
          vehicle_number: user.vehicle_number
        }
      })
    }

    return NextResponse.json({
      valid: true,
      message: 'Entry granted',
      user: {
        name: user.name,
        email: user.email,
        credits: user.credits,
        vehicle_number: user.vehicle_number
      }
    })
  } catch (error) {
    console.error('ANPR validation error:', error)
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    )
  }
}
