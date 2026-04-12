'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { BookParkingContent } from '@/components/book-parking-content'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Car } from 'lucide-react'
import { toast } from 'sonner'

function BookSessionGate({ children }: { children: React.ReactNode }) {
  const { user, loading, refreshUser } = useAuth()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (loading) return
    let cancelled = false
    ;(async () => {
      if (!user) {
        const res = await fetch('/api/auth/guest', { method: 'POST' })
        if (!res.ok) {
          const d = await res.json().catch(() => ({}))
          toast.error(typeof d.error === 'string' ? d.error : 'Could not start booking session')
          if (!cancelled) setReady(true)
          return
        }
        await refreshUser()
      }
      if (!cancelled) setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [loading, user, refreshUser])

  if (loading || !ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 ambient-app-bg px-4">
        <Spinner className="h-10 w-10 text-primary" />
        <p className="text-sm text-muted-foreground">Opening booking…</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center ambient-app-bg">
        <p className="max-w-md text-muted-foreground">
          Booking needs a guest profile in the database. Seed users or set <code className="text-foreground">GUEST_USER_ID</code> in your environment.
        </p>
        <Button asChild>
          <Link href="/register">Create an account</Link>
        </Button>
      </div>
    )
  }

  return <>{children}</>
}

export default function PublicBookPage() {
  return (
    <BookSessionGate>
      <div className="min-h-screen ambient-app-bg">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-background/70 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
            <Link href="/book" className="flex items-center gap-2 font-semibold text-foreground">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Car className="h-4 w-4" />
              </div>
              Smart Parking
            </Link>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">My parking</Link>
            </Button>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <BookParkingContent afterBookPath="/dashboard" />
        </main>
      </div>
    </BookSessionGate>
  )
}
