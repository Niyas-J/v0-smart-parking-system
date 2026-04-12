import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let user

  try {
    user = await requireAuth()
  } catch {
    redirect('/login')
  }

  if (user.role !== 'admin') {
    redirect('/dashboard')
  }

  return <>{children}</>
}
