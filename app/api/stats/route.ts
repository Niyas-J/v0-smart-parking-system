import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  try {
    await requireAdmin()

    const [
      totalUsers,
      totalSlots,
      activeBookings,
      pendingTopups,
      openTickets,
      todayRevenue,
      slotStats,
      recentBookings
    ] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM users WHERE role = 'user'`,
      sql`SELECT COUNT(*) as count FROM slots`,
      sql`SELECT COUNT(*) as count FROM bookings WHERE status = 'active'`,
      sql`SELECT COUNT(*) as count FROM topup_requests WHERE status = 'pending'`,
      sql`SELECT COUNT(*) as count FROM tickets WHERE status IN ('open', 'in_progress')`,
      sql`SELECT COALESCE(SUM(ABS(amount)), 0) as total FROM transactions WHERE type = 'payment' AND created_at >= CURRENT_DATE`,
      sql`
        SELECT 
          status,
          COUNT(*) as count
        FROM slots
        GROUP BY status
      `,
      sql`
        SELECT b.*, s.slot_number, u.name as user_name
        FROM bookings b
        JOIN slots s ON b.slot_id = s.id
        JOIN users u ON b.user_id = u.id
        ORDER BY b.created_at DESC
        LIMIT 5
      `
    ])

    return NextResponse.json({
      stats: {
        totalUsers: Number(totalUsers[0].count),
        totalSlots: Number(totalSlots[0].count),
        activeBookings: Number(activeBookings[0].count),
        pendingTopups: Number(pendingTopups[0].count),
        openTickets: Number(openTickets[0].count),
        todayRevenue: Number(todayRevenue[0].total),
        slotStats: slotStats,
        recentBookings: recentBookings
      }
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
