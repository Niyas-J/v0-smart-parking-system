import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { name, email, query } = await req.json()

    if (!name || !email || !query) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Insert into enquiries table using Neon neonctl or pg sql
    await sql`
      INSERT INTO enquiries (name, email, query)
      VALUES (${name}, ${email}, ${query})
    `

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Enquiry Submission Error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
