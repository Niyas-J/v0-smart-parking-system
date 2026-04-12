"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { DashboardNav } from '@/components/dashboard-nav'
import { Spinner } from '@/components/ui/spinner'

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center ambient-app-bg">
        <div className="relative">
          <Spinner className="h-10 w-10 text-primary" />
          <div className="absolute inset-0 animate-ping rounded-full border-2 border-primary/20" />
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen ambient-app-bg">
      <DashboardNav />
      <main className="lg:pl-72">
        <div className="px-4 py-8 sm:px-6 lg:px-10">{children}</div>
      </main>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  )
}
