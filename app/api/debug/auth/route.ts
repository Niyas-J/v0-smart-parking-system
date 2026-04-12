import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const users = await sql`SELECT id, email, password_hash FROM users WHERE email = 'admin@parking.com'`
    
    if (users.length === 0) {
      return NextResponse.json({
        error: 'Admin user not found',
        dbConnected: true,
        userCount: 0
      })
    }

    const admin = users[0]
    const testPassword = 'admin123'
    const isValid = await bcrypt.compare(testPassword, admin.password_hash)
    
    return NextResponse.json({
      dbConnected: true,
      userFound: true,
      email: admin.email,
      passwordHashPrefix: admin.password_hash.substring(0, 10),
      passwordTest: isValid ? 'CORRECT' : 'WRONG'
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      dbConnected: false
    }, { status: 500 })
  }
}
