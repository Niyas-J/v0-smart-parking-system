"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  Car, 
  LayoutDashboard, 
  CalendarDays, 
  Wallet, 
  Bell, 
  HelpCircle, 
  LogOut,
  Menu,
  Users,
  ParkingCircle,
  CreditCard,
  TicketIcon,
  BarChart3,
  X
} from 'lucide-react'

const userNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/book', label: 'Book Parking', icon: ParkingCircle },
  { href: '/dashboard/bookings', label: 'My Bookings', icon: CalendarDays },
  { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
  { href: '/dashboard/alerts', label: 'Alerts', icon: Bell },
  { href: '/dashboard/support', label: 'Support', icon: HelpCircle },
]

const adminNavItems = [
  { href: '/admin', label: 'Overview', icon: BarChart3 },
  { href: '/admin/slots', label: 'Manage Slots', icon: ParkingCircle },
  { href: '/admin/bookings', label: 'All Bookings', icon: CalendarDays },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/topups', label: 'Top-ups', icon: CreditCard },
  { href: '/admin/tickets', label: 'Tickets', icon: TicketIcon },
]

function NavContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const navItems = user?.role === 'admin' ? adminNavItems : userNavItems

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <Link href={user?.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-3" onClick={onClose}>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
            <Car className="w-5 h-5" />
          </div>
          <span className="font-semibold text-foreground text-lg">Smart Parking</span>
        </Link>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                isActive
                  ? "bg-primary text-primary-foreground shadow-[0_0_28px_-8px_color-mix(in_oklch,var(--primary)_55%,transparent)]"
                  : "text-muted-foreground hover:bg-secondary/80 hover:text-secondary-foreground hover:translate-x-0.5"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {user?.role === 'admin' && (
        <div className="px-4 py-3 border-t border-border">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            User Dashboard
          </Link>
        </div>
      )}

      <div className="px-4 py-4 border-t border-border">
        <div className="px-4 py-3 mb-3">
          <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          {user?.role !== 'admin' && (
            <p className="text-xs text-primary font-medium mt-1">
              Balance: ${Number(user?.credits || 0).toFixed(2)}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}

export function DashboardNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/65 backdrop-blur-xl supports-[backdrop-filter]:bg-background/45">
        <div className="flex items-center justify-between px-4 h-16">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
              <Car className="w-4 h-4" />
            </div>
            <span className="font-semibold text-foreground">Smart Parking</span>
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <NavContent onClose={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col border-r border-white/10 bg-card/75 backdrop-blur-xl supports-[backdrop-filter]:bg-card/55">
        <NavContent />
      </aside>

      {/* Mobile spacer */}
      <div className="h-16 lg:hidden" />
    </>
  )
}
