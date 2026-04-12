import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import type { Slot } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { inferParkingZone } from '@/lib/slot-zone'

function last14DaysUtc(): string[] {
  const days: string[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

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
      recentBookings,
      bookingTrendRows,
      allSlots,
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
      `,
      sql`
        SELECT 
          to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
          COUNT(*)::int AS bookings
        FROM bookings
        WHERE created_at >= NOW() - INTERVAL '14 days'
        GROUP BY 1
        ORDER BY 1
      `,
      sql`SELECT * FROM slots`,
    ])

    const trendMap = Object.fromEntries(
      (bookingTrendRows as { day: string; bookings: number }[]).map((t) => [
        t.day,
        t.bookings,
      ]),
    )
    const bookingTrends = last14DaysUtc().map((day) => ({
      day,
      bookings: trendMap[day] ?? 0,
    }))

    const slotRows = allSlots as Slot[]
    const zoneUtilization = ['bike', 'car', 'suv'].map((zone) => {
      const inZone = slotRows.filter((s) => inferParkingZone(s) === zone)
      const occupied = inZone.filter(
        (s) => s.status === 'occupied' || s.status === 'reserved',
      ).length
      const total = inZone.length
      return {
        zone,
        total,
        occupied,
        utilization: total ? Math.round((occupied / total) * 100) : 0,
      }
    })

    return NextResponse.json({
      stats: {
        totalUsers: Number(totalUsers[0].count),
        totalSlots: Number(totalSlots[0].count),
        activeBookings: Number(activeBookings[0].count),
        pendingTopups: Number(pendingTopups[0].count),
        openTickets: Number(openTickets[0].count),
        todayRevenue: Number(todayRevenue[0].total),
        slotStats: slotStats,
        recentBookings: recentBookings,
        bookingTrends,
        zoneUtilization,
      },
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
