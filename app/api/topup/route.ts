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

    let requests
    if (user.role === 'admin' && all) {
      if (status) {
        requests = await sql`
          SELECT t.*, u.name as user_name, u.email as user_email
          FROM topup_requests t
          JOIN users u ON t.user_id = u.id
          WHERE t.status = ${status}
          ORDER BY t.created_at DESC
        `
      } else {
        requests = await sql`
          SELECT t.*, u.name as user_name, u.email as user_email
          FROM topup_requests t
          JOIN users u ON t.user_id = u.id
          ORDER BY t.created_at DESC
        `
      }
    } else {
      if (status) {
        requests = await sql`
          SELECT * FROM topup_requests WHERE user_id = ${user.id} AND status = ${status}
          ORDER BY created_at DESC
        `
      } else {
        requests = await sql`
          SELECT * FROM topup_requests WHERE user_id = ${user.id}
          ORDER BY created_at DESC
        `
      }
    }

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Get topup requests error:', error)
    return NextResponse.json({ error: 'Failed to fetch topup requests' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { amount, payment_method } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO topup_requests (user_id, amount, payment_method)
      VALUES (${user.id}, ${amount}, ${payment_method || 'bank_transfer'})
      RETURNING *
    `

    return NextResponse.json({ request: result[0] })
  } catch (error) {
    console.error('Create topup request error:', error)
    return NextResponse.json({ error: 'Failed to create topup request' }, { status: 500 })
  }
}
