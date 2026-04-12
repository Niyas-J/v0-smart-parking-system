import { AuthProvider } from '@/lib/auth-context'

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
