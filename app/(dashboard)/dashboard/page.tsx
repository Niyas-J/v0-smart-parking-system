'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
} from 'recharts'
import {
  Wallet,
  ParkingCircle,
  Clock,
  ArrowRight,
  Car,
  Calendar,
  Bell,
  Activity,
} from 'lucide-react'
import type { Booking, Alert } from '@/lib/db'

type Analytics = {
  bookingTrends: { day: string; bookings: number }[]
  slotStatus: Record<string, number>
  zoneUtilization: { zone: string; total: number; occupied: number; utilization: number }[]
}

const PIE_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
]

export default function DashboardPage() {
  const { user, refreshUser } = useAuth()
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null)
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [bookingTotal, setBookingTotal] = useState(0)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, alertsRes, analyticsRes] = await Promise.all([
          fetch('/api/bookings'),
          fetch('/api/alerts'),
          fetch('/api/analytics'),
        ])

        const bookingsData = await bookingsRes.json()
        const alertsData = await alertsRes.json()
        const analyticsData = analyticsRes.ok ? await analyticsRes.json() : null

        const active = bookingsData.bookings?.find((b: Booking) => b.status === 'active')
        setActiveBooking(active || null)
        const list = bookingsData.bookings || []
        setRecentBookings(list.slice(0, 5))
        setBookingTotal(list.length)
        setAlerts(alertsData.alerts?.filter((a: Alert) => !a.is_read).slice(0, 3) || [])
        if (analyticsData && !analyticsData.error) {
          setAnalytics(analyticsData)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleEndParking = async () => {
    if (!activeBooking) return

    try {
      const res = await fetch(`/api/bookings/${activeBooking.id}/end`, {
        method: 'POST',
      })

      if (res.ok) {
        setActiveBooking(null)
        refreshUser()
        const bookingsRes = await fetch('/api/bookings')
        const bookingsData = await bookingsRes.json()
        const list = bookingsData.bookings || []
        setRecentBookings(list.slice(0, 5))
        setBookingTotal(list.length)
        const analyticsRes = await fetch('/api/analytics')
        if (analyticsRes.ok) setAnalytics(await analyticsRes.json())
      }
    } catch (error) {
      console.error('Error ending parking:', error)
    }
  }

  const formatDuration = (startTime: Date) => {
    const start = new Date(startTime)
    const now = new Date()
    const diffMs = now.getTime() - start.getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const pieData = analytics
    ? Object.entries(analytics.slotStatus).map(([name, value]) => ({
        name,
        value,
      }))
    : []

  const chartConfig = {
    bookings: { label: 'Bookings', color: 'var(--chart-1)' },
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="mt-1 text-muted-foreground">Live operations overview for your parking profile</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Link href="/dashboard/wallet" className="block group">
            <Card className="glass-panel float-card h-full cursor-pointer border-white/10 transition-all duration-300 hover:border-primary/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-[0_0_28px_-6px_var(--primary)]">
                      <Wallet className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Balance</p>
                      <p className="text-2xl font-bold text-foreground">${Number(user?.credits || 0).toFixed(2)}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Link href="/dashboard/book" className="block group">
            <Card className="glass-panel float-card h-full cursor-pointer border-white/10 transition-all duration-300 hover:border-primary/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20 text-accent-foreground">
                      <Car className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Vehicle</p>
                      <p className="text-2xl font-bold text-foreground">{user?.vehicle_number || 'Not set'}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Link href="/dashboard/bookings" className="block group">
            <Card className="glass-panel float-card h-full cursor-pointer border-white/10 transition-all duration-300 hover:border-primary/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total bookings</p>
                      <p className="text-2xl font-bold text-foreground">{bookingTotal}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>

      {analytics && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="glass-panel-strong border-white/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <CardTitle>Booking pulse</CardTitle>
              </div>
              <CardDescription>Facility-wide sessions started per day (last 14 days)</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="aspect-[16/9] w-full min-h-[220px]">
                <AreaChart data={analytics.bookingTrends} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-bookings)" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="var(--color-bookings)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="4 4" className="stroke-border/40" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(v) => v.slice(5)}
                  />
                  <YAxis allowDecimals={false} width={32} tickLine={false} axisLine={false} />
                  <ChartTooltip cursor={{ stroke: 'var(--border)', strokeDasharray: '4 4' }} content={<ChartTooltipContent />} />
                  <Area
                    dataKey="bookings"
                    type="monotone"
                    fill="url(#fillBookings)"
                    stroke="var(--color-bookings)"
                    strokeWidth={2}
                    isAnimationActive
                    animationDuration={1200}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="glass-panel-strong border-white/10">
            <CardHeader>
              <CardTitle>Live slot mix</CardTitle>
              <CardDescription>Current availability across the structure</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-between">
              {pieData.length > 0 ? (
                <ChartContainer
                  config={Object.fromEntries(pieData.map((d, i) => [d.name, { label: d.name, color: PIE_COLORS[i % PIE_COLORS.length] }]))}
                  className="mx-auto aspect-square w-full max-w-[240px]"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={52}
                      outerRadius={88}
                      paddingAngle={3}
                      isAnimationActive
                      animationDuration={1000}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="transparent" />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              ) : (
                <p className="text-sm text-muted-foreground">No slot telemetry yet</p>
              )}
              <div className="w-full max-w-xs space-y-2 text-sm">
                {analytics.zoneUtilization.map((z) => (
                  <div
                    key={z.zone}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-secondary/20 px-3 py-2"
                  >
                    <span className="capitalize text-muted-foreground">{z.zone}</span>
                    <span className="font-medium tabular-nums text-foreground">{z.utilization}% used</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {loading ? (
        <Card className="glass-panel border-white/10">
          <CardContent className="pt-6">
            <Skeleton className="h-24 w-full rounded-xl" />
          </CardContent>
        </Card>
      ) : activeBooking ? (
        <Card className="glass-panel neon-ring border-primary/40 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-primary">
                <ParkingCircle className="h-5 w-5" />
                Active parking
              </CardTitle>
              <Badge variant="default">In progress</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Slot</p>
                <p className="text-lg font-semibold text-foreground">{activeBooking.slot_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Floor</p>
                <p className="text-lg font-semibold text-foreground">{activeBooking.floor}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-lg font-semibold text-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(activeBooking.start_time)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rate</p>
                <p className="text-lg font-semibold text-foreground">${Number(activeBooking.hourly_rate).toFixed(2)}/hr</p>
              </div>
            </div>
            <Button
              onClick={handleEndParking}
              className="w-full rounded-xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] md:w-auto"
            >
              End parking session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-panel border-white/10">
          <CardContent className="pt-6">
            <div className="py-8 text-center">
              <ParkingCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium text-foreground">No active parking</h3>
              <p className="mb-4 text-muted-foreground">Launch the live deck and claim a bay</p>
              <Button
                asChild
                className="rounded-xl shadow-[0_0_36px_-8px_color-mix(in_oklch,var(--primary)_45%,transparent)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Link href="/dashboard/book">
                  Book parking <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {alerts.length > 0 && (
        <Link href="/dashboard/alerts" className="block group">
          <Card className="glass-panel float-card cursor-pointer border-white/10 transition-all duration-300 hover:border-primary/35">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <CardTitle>Recent alerts</CardTitle>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 rounded-xl bg-secondary/40 p-3 backdrop-blur-sm">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{alert.title}</p>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      <Link href="/dashboard/bookings" className="block group">
        <Card className="glass-panel float-card cursor-pointer border-white/10 transition-all duration-300 hover:border-primary/35">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent bookings</CardTitle>
                <CardDescription>Your parking history</CardDescription>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : recentBookings.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No bookings yet</p>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-secondary/30 p-4 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                        <ParkingCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Slot {booking.slot_number}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(booking.start_time)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          booking.status === 'active'
                            ? 'default'
                            : booking.status === 'completed'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {booking.status}
                      </Badge>
                      {booking.total_cost > 0 && (
                        <p className="mt-1 text-sm text-muted-foreground">${Number(booking.total_cost).toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
