"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Wallet, 
  ParkingCircle, 
  Clock, 
  ArrowRight,
  Car,
  Calendar,
  Bell
} from 'lucide-react'
import type { Booking, Alert } from '@/lib/db'

export default function DashboardPage() {
  const { user, refreshUser } = useAuth()
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null)
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, alertsRes] = await Promise.all([
          fetch('/api/bookings'),
          fetch('/api/alerts'),
        ])

        const bookingsData = await bookingsRes.json()
        const alertsData = await alertsRes.json()

        const active = bookingsData.bookings?.find((b: Booking) => b.status === 'active')
        setActiveBooking(active || null)
        setRecentBookings(bookingsData.bookings?.slice(0, 5) || [])
        setAlerts(alertsData.alerts?.filter((a: Alert) => !a.is_read).slice(0, 3) || [])
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
        // Refresh bookings
        const bookingsRes = await fetch('/api/bookings')
        const bookingsData = await bookingsRes.json()
        setRecentBookings(bookingsData.bookings?.slice(0, 5) || [])
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-muted-foreground mt-1">Here&apos;s your parking overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/wallet" className="block group">
          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-white/30 dark:border-slate-700/50 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-blue-600 dark:text-blue-400">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">${Number(user?.credits || 0).toFixed(2)}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/book" className="block group">
          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-white/30 dark:border-slate-700/50 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 text-green-600 dark:text-green-400">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vehicle</p>
                    <p className="text-2xl font-bold text-foreground">{user?.vehicle_number || 'Not set'}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/bookings" className="block group">
          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-white/30 dark:border-slate-700/50 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 text-purple-600 dark:text-purple-400">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                    <p className="text-2xl font-bold text-foreground">{recentBookings.length}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Active Booking */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ) : activeBooking ? (
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border-blue-200/50 dark:border-blue-800/50 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-primary">
                <ParkingCircle className="w-5 h-5" />
                Active Parking
              </CardTitle>
              <Badge variant="default">In Progress</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
                  <Clock className="w-4 h-4" />
                  {formatDuration(activeBooking.start_time)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rate</p>
                <p className="text-lg font-semibold text-foreground">${Number(activeBooking.hourly_rate).toFixed(2)}/hr</p>
              </div>
            </div>
            <Button onClick={handleEndParking} className="w-full md:w-auto">
              End Parking Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-white/30 dark:border-slate-700/50 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center mx-auto mb-4">
                <ParkingCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No Active Parking</h3>
              <p className="text-muted-foreground mb-4">Start a new parking session</p>
              <Button asChild className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25">
                <Link href="/dashboard/book">
                  Book Parking <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <Link href="/dashboard/alerts" className="block group">
          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-white/30 dark:border-slate-700/50 shadow-lg transition-all hover:shadow-xl hover:scale-[1.01] cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  <CardTitle>Recent Alerts</CardTitle>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="flex-1">
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

      {/* Recent Bookings */}
      <Link href="/dashboard/bookings" className="block group">
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-white/30 dark:border-slate-700/50 shadow-lg transition-all hover:shadow-xl hover:scale-[1.01] cursor-pointer">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Your parking history</CardDescription>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : recentBookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No bookings yet</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                      <ParkingCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Slot {booking.slot_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(booking.start_time)}
                      </p>
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
                      <p className="text-sm text-muted-foreground mt-1">
                        ${Number(booking.total_cost).toFixed(2)}
                      </p>
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
