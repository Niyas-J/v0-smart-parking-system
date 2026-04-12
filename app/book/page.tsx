'use client'

import Link from 'next/link'
import { BookParkingContent } from '@/components/book-parking-content'
import { Button } from '@/components/ui/button'
import { Car } from 'lucide-react'

export default function PublicBookPage() {
  return (
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
  )
}
