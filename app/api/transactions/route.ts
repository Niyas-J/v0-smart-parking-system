import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const all = searchParams.get('all') === 'true'

    let transactions
    if (user.role === 'admin' && all) {
      if (type) {
        transactions = await sql`
          SELECT t.*, u.name as user_name, u.email as user_email
          FROM transactions t
          JOIN users u ON t.user_id = u.id
          WHERE t.type = ${type}
          ORDER BY t.created_at DESC
          LIMIT 100
        `
      } else {
        transactions = await sql`
          SELECT t.*, u.name as user_name, u.email as user_email
          FROM transactions t
          JOIN users u ON t.user_id = u.id
          ORDER BY t.created_at DESC
          LIMIT 100
        `
      }
    } else {
      if (type) {
        transactions = await sql`
          SELECT * FROM transactions WHERE user_id = ${user.id} AND type = ${type}
          ORDER BY created_at DESC
          LIMIT 50
        `
      } else {
        transactions = await sql`
          SELECT * FROM transactions WHERE user_id = ${user.id}
          ORDER BY created_at DESC
          LIMIT 50
        `
      }
    }

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('Get transactions error:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}
