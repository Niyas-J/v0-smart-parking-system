"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { ParkingCircle, Clock, Calendar, DollarSign } from 'lucide-react'
import type { Booking } from '@/lib/db'

export default function BookingsPage() {
  const { refreshUser } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [endingId, setEndingId] = useState<number | null>(null)

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings')
      const data = await res.json()
      setBookings(data.bookings || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const handleEndParking = async (bookingId: number) => {
    setEndingId(bookingId)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/end`, { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to end parking')
      }

      toast.success(`Parking ended. Total cost: $${data.totalCost.toFixed(2)}`)
      refreshUser()
      fetchBookings()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to end parking')
    } finally {
      setEndingId(null)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (startTime: Date, endTime?: Date | null) => {
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : new Date()
    const diffMs = end.getTime() - start.getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const activeBookings = bookings.filter((b) => b.status === 'active')
  const completedBookings = bookings.filter((b) => b.status === 'completed')
  const otherBookings = bookings.filter((b) => !['active', 'completed'].includes(b.status))

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <Card key={booking.id}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
              <ParkingCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">Slot {booking.slot_number}</h3>
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
              </div>
              <p className="text-sm text-muted-foreground capitalize">
                Floor {booking.floor} - {booking.slot_type}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Vehicle: {booking.vehicle_number}
              </p>
            </div>
          </div>

          {booking.status === 'active' && (
            <Button
              variant="destructive"
              size="sm"
              disabled={endingId === booking.id}
              onClick={() => handleEndParking(booking.id)}
            >
              {endingId === booking.id ? 'Ending...' : 'End Parking'}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Started</p>
              <p className="text-sm font-medium text-foreground">{formatDate(booking.start_time)}</p>
            </div>
          </div>
          {booking.end_time && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Ended</p>
                <p className="text-sm font-medium text-foreground">{formatDate(booking.end_time)}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-medium text-foreground">
                {formatDuration(booking.start_time, booking.end_time)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Cost</p>
              <p className="text-sm font-medium text-foreground">
                {booking.total_cost > 0
                  ? `$${Number(booking.total_cost).toFixed(2)}`
                  : `~$${(Math.ceil((new Date().getTime() - new Date(booking.start_time).getTime()) / (1000 * 60 * 60)) * Number(booking.hourly_rate)).toFixed(2)}`}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Bookings</h1>
        <p className="text-muted-foreground mt-1">View and manage your parking sessions</p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeBookings.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="space-y-4 mt-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : (
          <>
            <TabsContent value="all" className="space-y-4 mt-6">
              {bookings.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <ParkingCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No bookings found</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                bookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
              )}
            </TabsContent>

            <TabsContent value="active" className="space-y-4 mt-6">
              {activeBookings.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <ParkingCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No active bookings</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                activeBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-6">
              {completedBookings.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <ParkingCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No completed bookings</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                completedBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}
