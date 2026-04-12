import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { createSession } from '@/lib/auth'

/**
 * Starts a session as the shared guest/demo user so booking works without a login form.
 * Set GUEST_USER_ID to a real users.id, or omit it to use the first role=user row.
 */
export async function POST() {
  try {
    let userId: number

    if (process.env.GUEST_USER_ID) {
      userId = parseInt(process.env.GUEST_USER_ID, 10)
      if (Number.isNaN(userId)) {
        return NextResponse.json({ error: 'Invalid GUEST_USER_ID' }, { status: 500 })
      }
      const rows = await sql`SELECT id FROM users WHERE id = ${userId}`
      if (rows.length === 0) {
        return NextResponse.json({ error: 'Guest user not found' }, { status: 500 })
      }
    } else {
      const rows = await sql`
        SELECT id FROM users WHERE role = 'user' ORDER BY id ASC LIMIT 1
      `
      if (rows.length === 0) {
        return NextResponse.json(
          { error: 'No user row for guest mode. Seed the database or set GUEST_USER_ID.' },
          { status: 500 },
        )
      }
      userId = Number(rows[0].id)
    }

    await createSession(userId)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Guest session error:', e)
    return NextResponse.json({ error: 'Guest session failed' }, { status: 500 })
  }
}
