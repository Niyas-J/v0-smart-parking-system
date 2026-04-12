'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  ParkingCircle,
  Wallet,
  AlertCircle,
  Bike,
  Car,
  Truck,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from 'lucide-react'
import type { Slot, Booking } from '@/lib/db'
import type { ParkingZone } from '@/lib/slot-zone'
import { cn } from '@/lib/utils'

const ParkingLot3D = dynamic(
  () => import('@/components/parking-lot-3d').then((m) => m.ParkingLot3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(520px,70vh)] items-center justify-center rounded-2xl border border-white/10 bg-slate-950/60">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
          <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-cyan-300/80 animate-pulse" />
        </div>
      </div>
    ),
  },
)

type SlotRow = Slot & { zone?: string | null }

const ZONES: {
  id: ParkingZone
  label: string
  sub: string
  icon: typeof Bike
  accent: string
}[] = [
  {
    id: 'bike',
    label: 'Bike deck',
    sub: 'Compact stalls · lower rate',
    icon: Bike,
    accent: 'from-cyan-500/25 to-teal-500/10',
  },
  {
    id: 'car',
    label: 'Car deck',
    sub: 'Standard bays · high throughput',
    icon: Car,
    accent: 'from-blue-500/25 to-indigo-500/10',
  },
  {
    id: 'suv',
    label: 'SUV deck',
    sub: 'Wide bays · premium spacing',
    icon: Truck,
    accent: 'from-orange-500/25 to-amber-500/10',
  },
]

export function BookParkingContent({ afterBookPath = '/dashboard' }: { afterBookPath?: string }) {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [step, setStep] = useState(1)
  const [zone, setZone] = useState<ParkingZone>('car')
  const [slots, setSlots] = useState<SlotRow[]>([])
  const [selectedSlot, setSelectedSlot] = useState<SlotRow | null>(null)
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [loading, setLoading] = useState(true)
  const [zoneLoading, setZoneLoading] = useState(false)
  const [booking, setBooking] = useState(false)
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null)

  const loadSlots = useCallback(async (z: ParkingZone) => {
    setZoneLoading(true)
    try {
      const res = await fetch(`/api/slots?zone=${z}`)
      const data = await res.json()
      setSlots(data.slots || [])
    } catch {
      toast.error('Could not load live deck data')
    } finally {
      setZoneLoading(false)
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes] = await Promise.all([fetch('/api/bookings?status=active')])
        const bookingsData = await bookingsRes.json()
        setActiveBooking(bookingsData.bookings?.[0] || null)
        setVehicleNumber(user?.vehicle_number || '')
      } catch (error) {
        console.error('Error fetching bookings:', error)
        toast.error('Failed to load booking state')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.id, user?.vehicle_number])

  useEffect(() => {
    if (step >= 2) {
      void loadSlots(zone)
    }
  }, [step, zone, loadSlots])

  const handleBook = async () => {
    if (!selectedSlot) {
      toast.error('Select a slot in the live deck')
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

      toast.success('Session started — your vehicle is now on the deck.')
      refreshUser()
      await loadSlots(zone)
      setSelectedSlot(null)
      await new Promise((r) => setTimeout(r, 1400))
      router.push(afterBookPath)
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
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Book Parking</h1>
          <p className="mt-1 text-muted-foreground">Live facility routing and session control</p>
        </div>

        <Card className="glass-panel border-destructive/40 bg-destructive/5 neon-ring">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-destructive" />
              <div>
                <h3 className="font-semibold text-foreground">Active session detected</h3>
                <p className="mt-1 text-muted-foreground">
                  You already have an active parking session at slot {activeBooking.slot_number}.
                  End your current session before starting another.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => router.push(afterBookPath)}
                >
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
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Book Parking</h1>
          <p className="mt-1 text-muted-foreground">
            Futuristic live deck — pick a zone, select a glowing bay, confirm your plate.
          </p>
        </div>
        <div className="flex gap-2 rounded-2xl border border-border/60 bg-secondary/20 p-1">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={cn(
                'rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-300',
                step === n
                  ? 'bg-primary text-primary-foreground shadow-[0_0_24px_-4px_color-mix(in_oklch,var(--primary)_60%,transparent)]'
                  : 'text-muted-foreground',
              )}
            >
              {n === 1 && 'Zone'}
              {n === 2 && 'Live deck'}
              {n === 3 && 'Confirm'}
            </div>
          ))}
        </div>
      </div>

      {Number(user?.credits || 0) < 5 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-destructive/35 bg-destructive/5 p-4 glass-panel"
        >
          <div className="flex flex-wrap items-center gap-4">
            <Wallet className="h-6 w-6 text-destructive" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">Low balance</p>
              <p className="text-sm text-muted-foreground">
                Your balance is ${Number(user?.credits || 0).toFixed(2)}. Top up for uninterrupted access.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
              onClick={() => router.push('/dashboard/wallet')}
            >
              Top Up
            </Button>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.35 }}
            className="grid gap-4 md:grid-cols-3"
          >
            {ZONES.map((z) => (
              <button
                key={z.id}
                type="button"
                onClick={() => {
                  setZone(z.id)
                  setSelectedSlot(null)
                }}
                className={cn(
                  'glass-panel float-card rounded-2xl p-6 text-left transition-all duration-300',
                  zone === z.id
                    ? 'neon-ring ring-2 ring-primary/50'
                    : 'hover:border-primary/25',
                )}
              >
                <div
                  className={cn(
                    'mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-primary',
                    z.accent,
                  )}
                >
                  <z.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{z.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{z.sub}</p>
              </button>
            ))}
            <div className="md:col-span-3 flex justify-end">
              <Button
                size="lg"
                className="gap-2 rounded-xl px-8 shadow-[0_0_40px_-8px_color-mix(in_oklch,var(--primary)_55%,transparent)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => setStep(2)}
              >
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.35 }}
            className="grid gap-6 lg:grid-cols-3"
          >
            <div className="space-y-4 lg:col-span-2">
              <Card className="glass-panel-strong overflow-hidden border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Sparkles className="h-5 w-5 text-cyan-400" />
                    Live 3D deck
                  </CardTitle>
                  <CardDescription>
                    Available bays pulse green. Occupied or reserved glow red with a vehicle mesh. Tap a green bay
                    to select — the ring marks your pick.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading || zoneLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-[min(520px,70vh)] w-full rounded-2xl" />
                    </div>
                  ) : (
                    <ParkingLot3D
                      slots={slots}
                      selectedSlot={selectedSlot}
                      onSelectSlot={(s) => setSelectedSlot(s)}
                    />
                  )}
                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-emerald-200">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                      Available
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-rose-200">
                      <span className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_10px_#fb7185]" />
                      Booked / occupied
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1 text-violet-200">
                      <span className="h-2 w-2 rounded-full bg-violet-400" />
                      Selected
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col gap-4">
              <Card className="glass-panel float-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg">Deck summary</CardTitle>
                  <CardDescription>Real-time snapshot for this zone</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between rounded-xl bg-secondary/30 px-3 py-2">
                    <span className="text-muted-foreground">Zone</span>
                    <span className="font-medium capitalize text-foreground">{zone}</span>
                  </div>
                  <div className="flex justify-between rounded-xl bg-secondary/30 px-3 py-2">
                    <span className="text-muted-foreground">Visible bays</span>
                    <span className="font-medium text-foreground">{slots.length}</span>
                  </div>
                  <div className="flex justify-between rounded-xl bg-secondary/30 px-3 py-2">
                    <span className="text-muted-foreground">Available</span>
                    <span className="font-medium text-emerald-400">
                      {slots.filter((s) => s.status === 'available').length}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => setStep(1)}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <Button
                  className="flex-1 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  disabled={!selectedSlot}
                  onClick={() => setStep(3)}
                >
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="mx-auto max-w-lg"
          >
            <Card className="glass-panel-strong border-white/10 neon-ring">
              <CardHeader>
                <CardTitle>Confirm session</CardTitle>
                <CardDescription>Vehicle identity and billing preview</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup className="gap-5">
                  {selectedSlot ? (
                    <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_24px_-4px_var(--primary)]">
                          <ParkingCircle className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Bay {selectedSlot.slot_number}</p>
                          <p className="text-sm capitalize text-muted-foreground">
                            {zone} deck · Floor {selectedSlot.floor}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Hourly rate</span>
                        <span className="font-semibold text-foreground">
                          ${Number(selectedSlot.hourly_rate).toFixed(2)}/hr
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground">No bay selected — go back to the deck.</p>
                  )}

                  <Field>
                    <FieldLabel>Vehicle number</FieldLabel>
                    <Input
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      placeholder="ABC-1234"
                      className="rounded-xl border-white/10 bg-background/40 backdrop-blur-sm"
                    />
                  </Field>

                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-secondary/20 px-4 py-3">
                    <span className="text-sm text-muted-foreground">Wallet</span>
                    <span className="font-semibold text-foreground">${Number(user?.credits || 0).toFixed(2)}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      onClick={() => setStep(2)}
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" /> Deck
                    </Button>
                    <Button
                      className="flex-1 rounded-xl shadow-[0_0_36px_-6px_color-mix(in_oklch,var(--primary)_50%,transparent)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      disabled={!selectedSlot || !vehicleNumber.trim() || booking}
                      onClick={handleBook}
                    >
                      {booking ? 'Starting…' : 'Start parking'}
                    </Button>
                  </div>

                  <p className="text-center text-xs text-muted-foreground">
                    You are billed for duration when you end the session from the dashboard.
                  </p>
                </FieldGroup>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
