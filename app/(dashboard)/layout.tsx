import { redirect } from 'next/navigation'
import { AuthProvider } from '@/lib/auth-context'
import { requireAuth } from '@/lib/auth'

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
      {children}
    </AuthProvider>
  )
}
