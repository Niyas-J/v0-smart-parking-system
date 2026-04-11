import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSession, requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const all = searchParams.get('all') === 'true'

    let tickets
    if (user.role === 'admin' && all) {
      if (status) {
        tickets = await sql`
          SELECT t.*, u.name as user_name, u.email as user_email
          FROM tickets t
          JOIN users u ON t.user_id = u.id
          WHERE t.status = ${status}
          ORDER BY 
            CASE t.priority 
              WHEN 'urgent' THEN 1 
              WHEN 'high' THEN 2 
              WHEN 'normal' THEN 3 
              WHEN 'low' THEN 4 
            END,
            t.created_at DESC
        `
      } else {
        tickets = await sql`
          SELECT t.*, u.name as user_name, u.email as user_email
          FROM tickets t
          JOIN users u ON t.user_id = u.id
          ORDER BY 
            CASE t.priority 
              WHEN 'urgent' THEN 1 
              WHEN 'high' THEN 2 
              WHEN 'normal' THEN 3 
              WHEN 'low' THEN 4 
            END,
            t.created_at DESC
        `
      }
    } else {
      if (status) {
        tickets = await sql`
          SELECT * FROM tickets WHERE user_id = ${user.id} AND status = ${status}
          ORDER BY created_at DESC
        `
      } else {
        tickets = await sql`
          SELECT * FROM tickets WHERE user_id = ${user.id}
          ORDER BY created_at DESC
        `
      }
    }

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('Get tickets error:', error)
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { subject, message, priority } = await request.json()

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO tickets (user_id, subject, message, priority)
      VALUES (${user.id}, ${subject}, ${message}, ${priority || 'normal'})
      RETURNING *
    `

    return NextResponse.json({ ticket: result[0] })
  } catch (error) {
    console.error('Create ticket error:', error)
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
  }
}
