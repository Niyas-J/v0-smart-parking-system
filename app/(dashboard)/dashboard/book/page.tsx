"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Skeleton } from '@/components/ui/skeleton'
import { SlotGrid } from '@/components/slot-grid'
import { toast } from 'sonner'
import { ParkingCircle, Wallet, AlertCircle } from 'lucide-react'
import type { Slot, Booking } from '@/lib/db'

export default function BookParkingPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [slotsRes, bookingsRes] = await Promise.all([
          fetch('/api/slots'),
          fetch('/api/bookings?status=active'),
        ])

        const slotsData = await slotsRes.json()
        const bookingsData = await bookingsRes.json()

        setSlots(slotsData.slots || [])
        setActiveBooking(bookingsData.bookings?.[0] || null)
        setVehicleNumber(user?.vehicle_number || '')
      } catch (error) {
        console.error('Error fetching slots:', error)
        toast.error('Failed to load parking slots')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.vehicle_number])

  const handleBook = async () => {
    if (!selectedSlot) {
      toast.error('Please select a parking slot')
      return
    }

    if (!vehicleNumber.trim()) {
      toast.error('Please enter your vehicle number')
      return
    }

    if (Number(user?.credits || 0) < Number(selectedSlot.hourly_rate)) {
      toast.error('Insufficient balance. Please top up your wallet.')
      return
    }

    setBooking(true)

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot_id: selectedSlot.id,
          vehicle_number: vehicleNumber.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to book parking')
      }

      toast.success('Parking booked successfully!')
      refreshUser()
      router.push('/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to book parking')
    } finally {
      setBooking(false)
    }
  }

  if (activeBooking) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Book Parking</h1>
          <p className="text-muted-foreground mt-1">Find and reserve your parking spot</p>
        </div>

        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-destructive mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Active Booking Exists</h3>
                <p className="text-muted-foreground mt-1">
                  You already have an active parking session at slot {activeBooking.slot_number}. 
                  Please end your current session before booking a new one.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard')}>
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Book Parking</h1>
        <p className="text-muted-foreground mt-1">Find and reserve your parking spot</p>
      </div>

      {/* Balance Warning */}
      {Number(user?.credits || 0) < 5 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Wallet className="w-6 h-6 text-destructive" />
              <div>
                <p className="font-medium text-foreground">Low Balance</p>
                <p className="text-sm text-muted-foreground">
                  Your balance is ${Number(user?.credits || 0).toFixed(2)}. Consider topping up before booking.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/wallet')}>
                Top Up
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Slot Selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Select a Parking Slot</CardTitle>
              <CardDescription>Click on an available slot to select it</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <div className="grid grid-cols-5 gap-3">
                    {[...Array(10)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                </div>
              ) : (
                <SlotGrid
                  slots={slots}
                  selectedSlot={selectedSlot}
                  onSelectSlot={setSelectedSlot}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Booking Form */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
              <CardDescription>Confirm your parking reservation</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                {selectedSlot ? (
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground">
                        <ParkingCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Slot {selectedSlot.slot_number}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          Floor {selectedSlot.floor} - {selectedSlot.slot_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Hourly Rate</span>
                      <span className="font-semibold text-foreground">
                        ${Number(selectedSlot.hourly_rate).toFixed(2)}/hr
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-secondary/50 text-center">
                    <ParkingCircle className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Select a parking slot from the grid
                    </p>
                  </div>
                )}

                <Field>
                  <FieldLabel>Vehicle Number</FieldLabel>
                  <Input
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="ABC-1234"
                  />
                </Field>

                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <span className="text-sm text-muted-foreground">Your Balance</span>
                  <span className="font-semibold text-foreground">
                    ${Number(user?.credits || 0).toFixed(2)}
                  </span>
                </div>

                <Button
                  className="w-full"
                  disabled={!selectedSlot || !vehicleNumber.trim() || booking}
                  onClick={handleBook}
                >
                  {booking ? 'Booking...' : 'Start Parking'}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  You will be charged based on parking duration when you end your session.
                </p>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
