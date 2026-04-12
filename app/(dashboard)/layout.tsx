import { redirect } from 'next/navigation'
import { AuthProvider } from '@/lib/auth-context'
import { requireAuth } from '@/lib/auth'
import { DashboardNav } from '@/components/dashboard-nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    await requireAuth()
  } catch {
    redirect('/login')
  }

  return (
    <AuthProvider>
      <DashboardNav />
      <main className="lg:pl-72">
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </AuthProvider>
  )
}
