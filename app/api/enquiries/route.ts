import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Create table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS enquiries (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    await sql`
      INSERT INTO enquiries (name, email, message)
      VALUES (${name}, ${email}, ${message})
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Enquiry error:', error)
    return NextResponse.json(
      { error: 'Failed to submit enquiry' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const enquiries = await sql`
      SELECT * FROM enquiries ORDER BY created_at DESC
    `
    return NextResponse.json(enquiries)
  } catch {
    return NextResponse.json([])
  }
}
