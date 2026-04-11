import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getSession()

    if (!user) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
        vehicle_number: user.vehicle_number,
        phone: user.phone,
      },
    })
  } catch (error) {
    console.error('Get session error:', error)
    return NextResponse.json({ user: null })
  }
}
