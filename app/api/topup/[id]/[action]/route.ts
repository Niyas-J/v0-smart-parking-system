import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  try {
    const admin = await requireAdmin()
    const { id, action } = await params
    const body = await request.json().catch(() => ({}))

    // Get topup request
    const requests = await sql`SELECT * FROM topup_requests WHERE id = ${parseInt(id)}`
    if (requests.length === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const topupRequest = requests[0]

    if (topupRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Request already processed' }, { status: 400 })
    }

    if (action === 'approve') {
      // Update user credits
      const users = await sql`SELECT * FROM users WHERE id = ${topupRequest.user_id}`
      const newBalance = Number(users[0].credits) + Number(topupRequest.amount)
      
      await sql`UPDATE users SET credits = ${newBalance}, updated_at = NOW() WHERE id = ${topupRequest.user_id}`

      // Update request status
      await sql`
        UPDATE topup_requests 
        SET status = 'approved', processed_at = NOW(), processed_by = ${admin.id}, admin_notes = ${body.notes || null}
        WHERE id = ${parseInt(id)}
      `

      // Create transaction record
      await sql`
        INSERT INTO transactions (user_id, type, amount, balance_after, description)
        VALUES (${topupRequest.user_id}, 'topup', ${topupRequest.amount}, ${newBalance}, 'Credit top-up approved')
      `

      // Create alert
      await sql`
        INSERT INTO alerts (user_id, type, title, message)
        VALUES (${topupRequest.user_id}, 'system', 'Top-up Approved', ${'Your top-up request of $' + topupRequest.amount + ' has been approved.'})
      `

      return NextResponse.json({ success: true, newBalance })
    } else if (action === 'reject') {
      await sql`
        UPDATE topup_requests 
        SET status = 'rejected', processed_at = NOW(), processed_by = ${admin.id}, admin_notes = ${body.notes || null}
        WHERE id = ${parseInt(id)}
      `

      // Create alert
      await sql`
        INSERT INTO alerts (user_id, type, title, message)
        VALUES (${topupRequest.user_id}, 'system', 'Top-up Rejected', ${'Your top-up request of $' + topupRequest.amount + ' has been rejected.' + (body.notes ? ' Reason: ' + body.notes : '')})
      `

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Process topup error:', error)
    return NextResponse.json({ error: 'Failed to process topup request' }, { status: 500 })
  }
}
