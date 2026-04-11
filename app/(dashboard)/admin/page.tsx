"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Users, 
  ParkingCircle, 
  CalendarDays, 
  CreditCard, 
  TicketIcon,
  DollarSign,
  ArrowRight,
  TrendingUp
} from 'lucide-react'

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
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats')
        const data = await res.json()
        setStats(data.stats)
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, href: '/admin/users' },
    { label: 'Parking Slots', value: stats.totalSlots, icon: ParkingCircle, href: '/admin/slots' },
    { label: 'Active Bookings', value: stats.activeBookings, icon: CalendarDays, href: '/admin/bookings' },
    { label: 'Pending Top-ups', value: stats.pendingTopups, icon: CreditCard, href: '/admin/topups', highlight: stats.pendingTopups > 0 },
    { label: 'Open Tickets', value: stats.openTickets, icon: TicketIcon, href: '/admin/tickets', highlight: stats.openTickets > 0 },
    { label: 'Today Revenue', value: `$${stats.todayRevenue.toFixed(2)}`, icon: DollarSign },
  ] : []

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your parking management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))
        ) : (
          statCards.map((stat, i) => (
            <Card key={i} className={stat.highlight ? 'border-primary/50 bg-primary/5' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <div className={`flex items-center justify-center w-12 h-12 rounded-2xl ${stat.highlight ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                {stat.href && (
                  <Button variant="link" asChild className="px-0 mt-2">
                    <Link href={stat.href}>
                      View Details <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Slot Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Slot Distribution</CardTitle>
            <CardDescription>Current status of parking slots</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <div className="space-y-4">
                {stats?.slotStats.map((stat) => {
                  const percentage = stats.totalSlots > 0 
                    ? (Number(stat.count) / stats.totalSlots) * 100 
                    : 0
                  
                  const colors: Record<string, string> = {
                    available: 'bg-[oklch(var(--slot-available))]',
                    occupied: 'bg-[oklch(var(--slot-occupied))]',
                    reserved: 'bg-[oklch(var(--slot-reserved))]',
                    maintenance: 'bg-[oklch(var(--slot-maintenance))]',
                  }

                  return (
                    <div key={stat.status}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground capitalize">{stat.status}</span>
                        <span className="text-sm text-muted-foreground">{stat.count} slots</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colors[stat.status] || 'bg-primary'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Latest parking activity</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/bookings">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : stats?.recentBookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No recent bookings</p>
            ) : (
              <div className="space-y-3">
                {stats?.recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-secondary/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                        <ParkingCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Slot {booking.slot_number}</p>
                        <p className="text-sm text-muted-foreground">{booking.user_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'active' 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-secondary text-secondary-foreground'
                      }`}>
                        {booking.status}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(booking.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
