"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { DashboardNav } from '@/components/dashboard-nav'
import { Spinner } from '@/components/ui/spinner'

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter()

  // Allow guest access - no redirect to login
  // Users can access dashboard directly for demo purposes

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    )
  }

  // Always render dashboard (guest mode enabled)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 dark:from-slate-950 dark:via-blue-950/10 dark:to-slate-900">
      <DashboardNav />
      <main className="lg:pl-72">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {user?.id === 0 && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 dark:border-blue-800/50">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Guest Mode:</span> You&apos;re browsing as a guest with $1000 demo credits. 
                <a href="/login" className="text-primary hover:underline ml-1">Sign in</a> or 
                <a href="/register" className="text-primary hover:underline ml-1">create an account</a> to save your data.
              </p>
            </div>
          )}
          {children}
        </div>
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
