import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import type { Slot } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
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
    await requireAuth()

    const [trends, slots] = await Promise.all([
      sql`
        SELECT 
          to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
          COUNT(*)::int AS bookings
        FROM bookings
        WHERE created_at >= NOW() - INTERVAL '14 days'
        GROUP BY 1
        ORDER BY 1
      `,
      sql`SELECT * FROM slots ORDER BY floor, slot_number`,
    ])

    const slotRows = slots as Slot[]
    const zoneUsage: Record<string, { total: number; occupied: number }> = {}
    for (const s of slotRows) {
      const z = inferParkingZone(s)
      if (!zoneUsage[z]) zoneUsage[z] = { total: 0, occupied: 0 }
      zoneUsage[z].total++
      if (s.status === 'occupied' || s.status === 'reserved') {
        zoneUsage[z].occupied++
      }
    }

    const slotStatus = slotRows.reduce(
      (acc, s) => {
        acc[s.status] = (acc[s.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const trendMap = Object.fromEntries(
      (trends as { day: string; bookings: number }[]).map((t) => [t.day, t.bookings]),
    )
    const bookingTrends = last14DaysUtc().map((day) => ({
      day,
      bookings: trendMap[day] ?? 0,
    }))

    const zoneUtilization = Object.entries(zoneUsage).map(([zone, v]) => ({
      zone,
      total: v.total,
      occupied: v.occupied,
      utilization: v.total ? Math.round((v.occupied / v.total) * 100) : 0,
    }))

    return NextResponse.json({
      bookingTrends,
      slotStatus,
      zoneUtilization,
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 })
  }
}
