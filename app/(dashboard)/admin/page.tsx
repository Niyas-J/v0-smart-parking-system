'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Bar, BarChart } from 'recharts'
import {
  Users,
  ParkingCircle,
  CalendarDays,
  CreditCard,
  TicketIcon,
  DollarSign,
  ArrowRight,
  Radio,
  ShieldAlert,
} from 'lucide-react'
import type { Alert } from '@/lib/db'

interface Stats {
  totalUsers: number
  totalSlots: number
  activeBookings: number
  pendingTopups: number
  openTickets: number
  todayRevenue: number
  slotStats: { status: string; count: number }[]
  recentBookings: {
    id: number
    slot_number: string
    user_name: string
    status: string
    created_at: Date
  }[]
  bookingTrends: { day: string; bookings: number }[]
  zoneUtilization: {
    zone: string
    total: number
    occupied: number
    utilization: number
  }[]
}

type AdminAlert = Alert & { user_name?: string | null; user_email?: string | null }

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [alerts, setAlerts] = useState<AdminAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [liveTick, setLiveTick] = useState(0)

  const load = useCallback(async () => {
    try {
      const [statsRes, alertsRes] = await Promise.all([fetch('/api/stats'), fetch('/api/admin/alerts')])
      const data = await statsRes.json()
      setStats(data.stats)
      if (alertsRes.ok) {
        const a = await alertsRes.json()
        setAlerts(a.alerts || [])
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const id = window.setInterval(() => {
      setLiveTick((t) => t + 1)
      void load()
    }, 12000)
    return () => clearInterval(id)
  }, [load])

  const statCards = stats
    ? [
        { label: 'Total users', value: stats.totalUsers, icon: Users, href: '/admin/users' },
        { label: 'Parking slots', value: stats.totalSlots, icon: ParkingCircle, href: '/admin/slots' },
        { label: 'Active bookings', value: stats.activeBookings, icon: CalendarDays, href: '/admin/bookings' },
        {
          label: 'Pending top-ups',
          value: stats.pendingTopups,
          icon: CreditCard,
          href: '/admin/topups',
          highlight: stats.pendingTopups > 0,
        },
        {
          label: 'Open tickets',
          value: stats.openTickets,
          icon: TicketIcon,
          href: '/admin/tickets',
          highlight: stats.openTickets > 0,
        },
        { label: 'Today revenue', value: `$${stats.todayRevenue.toFixed(2)}`, icon: DollarSign },
      ]
    : []

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const trendConfig = { bookings: { label: 'Sessions', color: 'var(--chart-1)' } }
  const zoneChartData =
    stats?.zoneUtilization.map((z) => ({
      zone: z.zone.toUpperCase(),
      utilization: z.utilization,
    })) || []

  const alertThumb = (a: AdminAlert) =>
    a.image_url ||
    `https://picsum.photos/seed/smartpark-alert-${a.id}/400/220`

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Command center</h1>
          <p className="mt-1 text-muted-foreground">Real-time operations, utilization, and alert imagery</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-300">
          <Radio className="h-3.5 w-3.5 animate-pulse" />
          Live sync · refresh every 12s
          <span className="tabular-nums text-muted-foreground">#{liveTick}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? [...Array(6)].map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-2xl" />)
          : statCards.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card
                  className={`glass-panel float-card h-full border-white/10 ${stat.highlight ? 'neon-ring border-primary/40 bg-primary/5' : ''}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">{stat.value}</p>
                      </div>
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                          stat.highlight
                            ? 'bg-primary text-primary-foreground shadow-[0_0_28px_-6px_var(--primary)]'
                            : 'bg-secondary text-secondary-foreground'
                        }`}
                      >
                        <stat.icon className="h-6 w-6" />
                      </div>
                    </div>
                    {stat.href && (
                      <Button variant="link" asChild className="mt-2 h-auto px-0 text-primary">
                        <Link href={stat.href} className="gap-1">
                          View <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-panel-strong border-white/10">
          <CardHeader>
            <CardTitle>Booking trends</CardTitle>
            <CardDescription>Sessions started per day across the estate</CardDescription>
          </CardHeader>
          <CardContent>
            {loading || !stats ? (
              <Skeleton className="h-56 w-full rounded-xl" />
            ) : (
              <ChartContainer config={trendConfig} className="aspect-[16/9] w-full min-h-[220px]">
                <AreaChart data={stats.bookingTrends} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="adminFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-bookings)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--color-bookings)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="4 4" className="stroke-border/40" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => v.slice(5)} />
                  <YAxis allowDecimals={false} width={28} tickLine={false} axisLine={false} />
                  <ChartTooltip cursor={{ stroke: 'var(--border)', strokeDasharray: '4 4' }} content={<ChartTooltipContent />} />
                  <Area
                    dataKey="bookings"
                    type="monotone"
                    fill="url(#adminFill)"
                    stroke="var(--color-bookings)"
                    strokeWidth={2}
                    isAnimationActive
                    animationDuration={1100}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel-strong border-white/10">
          <CardHeader>
            <CardTitle>Zone pressure</CardTitle>
            <CardDescription>Utilization % by vehicle class deck</CardDescription>
          </CardHeader>
          <CardContent>
            {loading || !stats ? (
              <Skeleton className="h-56 w-full rounded-xl" />
            ) : (
              <ChartContainer
                config={{
                  utilization: { label: 'Used %', color: 'var(--chart-2)' },
                }}
                className="aspect-[16/9] w-full min-h-[220px]"
              >
                <BarChart data={zoneChartData} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="4 4" className="stroke-border/40" />
                  <XAxis dataKey="zone" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis domain={[0, 100]} width={32} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="utilization"
                    fill="var(--color-utilization)"
                    radius={[8, 8, 0, 0]}
                    isAnimationActive
                    animationDuration={900}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-white/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            <CardTitle>Alert stream</CardTitle>
          </div>
          <CardDescription>Latest signals with visual context (live feed)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
            </div>
          ) : alerts.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No alerts in the stream</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {alerts.slice(0, 6).map((a) => (
                <div
                  key={a.id}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-secondary/20 shadow-[0_0_40px_-20px_rgba(99,102,241,0.35)] transition-all duration-300 hover:border-primary/30"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={alertThumb(a)}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                    <Badge className="absolute left-3 top-3 bg-background/80 text-foreground backdrop-blur-sm" variant="secondary">
                      {a.type?.replace('_', ' ') || 'alert'}
                    </Badge>
                  </div>
                  <div className="space-y-1 p-4">
                    <p className="font-medium leading-snug text-foreground">{a.title}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{a.message}</p>
                    {a.user_name && (
                      <p className="text-xs text-muted-foreground">
                        User · {a.user_name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Link href="/admin/slots" className="block group">
          <Card className="glass-panel float-card h-full cursor-pointer border-white/10 transition-all duration-300 hover:border-primary/35">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Slot distribution</CardTitle>
                  <CardDescription>Status mix across all bays</CardDescription>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              {loading || !stats ? (
                <Skeleton className="h-40 w-full rounded-xl" />
              ) : (
                <div className="space-y-4">
                  {stats.slotStats.map((s) => {
                    const percentage = stats.totalSlots > 0 ? (Number(s.count) / stats.totalSlots) * 100 : 0
                    const colors: Record<string, string> = {
                      available: 'bg-emerald-500',
                      occupied: 'bg-rose-500',
                      reserved: 'bg-blue-500',
                      maintenance: 'bg-slate-500',
                    }
                    return (
                      <div key={s.status}>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium capitalize text-foreground">{s.status}</span>
                          <span className="text-sm text-muted-foreground">{s.count} slots</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-secondary">
                          <motion.div
                            className={`h-full rounded-full ${colors[s.status] || 'bg-primary'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.9, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/bookings" className="block group">
          <Card className="glass-panel float-card h-full cursor-pointer border-white/10 transition-all duration-300 hover:border-primary/35">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent bookings</CardTitle>
                  <CardDescription>Latest parking activity</CardDescription>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              {loading || !stats ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                  ))}
                </div>
              ) : stats.recentBookings.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No recent bookings</p>
              ) : (
                <div className="space-y-3">
                  {stats.recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-secondary/30 p-3 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                          <ParkingCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Slot {booking.slot_number}</p>
                          <p className="text-sm text-muted-foreground">{booking.user_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            booking.status === 'active'
                              ? 'bg-primary/15 text-primary'
                              : 'bg-secondary text-secondary-foreground'
                          }`}
                        >
                          {booking.status}
                        </span>
                        <p className="mt-1 text-xs text-muted-foreground">{formatDate(booking.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
