"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { CalendarDays, Clock } from 'lucide-react'
import type { Booking } from '@/lib/db'

const statusColors: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  active: 'default',
  completed: 'secondary',
  cancelled: 'outline',
  expired: 'destructive',
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [endingId, setEndingId] = useState<number | null>(null)

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings?all=true')
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

  const handleEndBooking = async (bookingId: number) => {
    setEndingId(bookingId)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/end`, { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to end booking')
      }

      toast.success(`Booking ended. Total cost: $${data.totalCost.toFixed(2)}`)
      fetchBookings()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to end booking')
    } finally {
      setEndingId(null)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
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

  const BookingsTable = ({ data }: { data: Booking[] }) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Slot</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{booking.user_name}</p>
                  <p className="text-sm text-muted-foreground">{booking.user_email}</p>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{booking.slot_number}</p>
                  <p className="text-sm text-muted-foreground capitalize">Floor {booking.floor}</p>
                </div>
              </TableCell>
              <TableCell>{booking.vehicle_number}</TableCell>
              <TableCell>{formatDate(booking.start_time)}</TableCell>
              <TableCell className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                {formatDuration(booking.start_time, booking.end_time)}
              </TableCell>
              <TableCell>
                {booking.total_cost > 0
                  ? `$${Number(booking.total_cost).toFixed(2)}`
                  : `~$${(Math.ceil((new Date().getTime() - new Date(booking.start_time).getTime()) / (1000 * 60 * 60)) * Number(booking.hourly_rate)).toFixed(2)}`}
              </TableCell>
              <TableCell>
                <Badge variant={statusColors[booking.status]}>{booking.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                {booking.status === 'active' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={endingId === booking.id}
                    onClick={() => handleEndBooking(booking.id)}
                  >
                    {endingId === booking.id ? 'Ending...' : 'End'}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">All Bookings</h1>
        <p className="text-muted-foreground mt-1">Manage parking bookings</p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeBookings.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
        </TabsList>

        <Card className="mt-6">
          <CardContent className="pt-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <>
                <TabsContent value="all" className="mt-0">
                  {bookings.length === 0 ? (
                    <div className="text-center py-12">
                      <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No bookings found</p>
                    </div>
                  ) : (
                    <BookingsTable data={bookings} />
                  )}
                </TabsContent>

                <TabsContent value="active" className="mt-0">
                  {activeBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No active bookings</p>
                    </div>
                  ) : (
                    <BookingsTable data={activeBookings} />
                  )}
                </TabsContent>

                <TabsContent value="completed" className="mt-0">
                  {completedBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No completed bookings</p>
                    </div>
                  ) : (
                    <BookingsTable data={completedBookings} />
                  )}
                </TabsContent>
              </>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}
