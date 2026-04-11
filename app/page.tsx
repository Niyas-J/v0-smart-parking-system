import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Car, 
  Clock, 
  CreditCard, 
  Bell, 
  Shield, 
  Smartphone,
  ArrowRight,
  CheckCircle,
  Users,
  HelpCircle,
  MessageSquare
} from 'lucide-react'

const features = [
  {
    icon: Car,
    title: 'Real-Time Slot Availability',
    description: 'View available parking spots instantly with our interactive slot grid visualization.',
  },
  {
    icon: Clock,
    title: 'Flexible Parking Duration',
    description: 'Park for as long as you need. Pay only for the time you use with per-hour billing.',
  },
  {
    icon: CreditCard,
    title: 'Easy Credit System',
    description: 'Top up your wallet and pay seamlessly. No cash needed, no hassle.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Get alerts for low balance, booking confirmations, and special promotions.',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Your data and payments are protected with enterprise-grade security.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Friendly',
    description: 'Access from any device. Book and manage parking on the go.',
  },
]

const benefits = [
  'No more circling for parking spots',
  'Save time with quick digital booking',
  'Track your parking history and expenses',
  'Get support when you need it',
]

const sponsors = [
  { name: 'TechCorp', logo: 'TC' },
  { name: 'AutoPark Inc', logo: 'AP' },
  { name: 'CityMobility', logo: 'CM' },
  { name: 'GreenDrive', logo: 'GD' },
  { name: 'SmartCity Labs', logo: 'SC' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-900">
      {/* Header with Glassmorphism */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-4 mt-4">
          <div className="max-w-7xl mx-auto bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-lg shadow-black/5">
            <div className="flex items-center justify-between h-16 px-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25">
                  <Car className="w-5 h-5" />
                </div>
                <span className="font-semibold text-foreground text-lg">Smart Parking</span>
              </Link>
              
              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/team" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  Team
                </Link>
                <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  FAQ
                </Link>
                <Link href="/enquiry" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  Contact
                </Link>
              </nav>

              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Glassmorphism */}
      <section className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/30 dark:border-slate-700/50 mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-muted-foreground">20+ slots available now</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground tracking-tight text-balance">
            Parking Made
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Simple</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Find, book, and pay for parking in seconds. No more searching for spots or fumbling for change.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-xl shadow-blue-500/25 h-12 px-8">
              <Link href="/dashboard">
                Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/30 dark:border-slate-700/50 h-12 px-8">
              <Link href="/register">Create Account</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Quick access: Go directly to dashboard or use john@example.com to login
          </p>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-8">Trusted by leading organizations</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {sponsors.map((sponsor, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/30 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                  {sponsor.logo}
                </div>
                <span className="font-medium text-foreground">{sponsor.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid with Glassmorphism */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Everything You Need
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A complete parking solution designed for your convenience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-white/30 dark:border-slate-700/50 shadow-xl shadow-black/5 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400 mb-4">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5" />
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Why Choose Smart Parking?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                We&apos;ve reimagined the parking experience to make it effortless, 
                efficient, and stress-free.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl shadow-blue-500/25">
                <CardContent className="pt-6">
                  <p className="text-4xl font-bold">20+</p>
                  <p className="text-sm opacity-80 mt-1">Parking Slots</p>
                </CardContent>
              </Card>
              <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-white/30 dark:border-slate-700/50">
                <CardContent className="pt-6">
                  <p className="text-4xl font-bold text-foreground">24/7</p>
                  <p className="text-sm text-muted-foreground mt-1">Available</p>
                </CardContent>
              </Card>
              <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-white/30 dark:border-slate-700/50">
                <CardContent className="pt-6">
                  <p className="text-4xl font-bold text-foreground">$2</p>
                  <p className="text-sm text-muted-foreground mt-1">Starting Rate/hr</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-xl border-white/30 dark:border-slate-700/50">
                <CardContent className="pt-6">
                  <p className="text-4xl font-bold text-foreground">4</p>
                  <p className="text-sm text-muted-foreground mt-1">Slot Types</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/team" className="group">
              <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-white/30 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all h-full">
                <CardContent className="pt-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Users className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Meet Our Team</h3>
                  <p className="text-sm text-muted-foreground">Learn about the people behind Smart Parking</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/faq" className="group">
              <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-white/30 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all h-full">
                <CardContent className="pt-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <HelpCircle className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">FAQ</h3>
                  <p className="text-sm text-muted-foreground">Find answers to common questions</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/enquiry" className="group">
              <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-white/30 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all h-full">
                <CardContent className="pt-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-7 h-7 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Contact Us</h3>
                  <p className="text-sm text-muted-foreground">Have questions? Reach out to us</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section with Glassmorphism */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGMxOS44ODIgMCAzNi0xNi4xMTggMzYtMzZTNTUuODgyIDAgMzYgMHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />
            <div className="relative px-8 py-16 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Ready to Park Smarter?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Join thousands of drivers who have simplified their parking experience.
              </p>
              <Button size="lg" variant="secondary" asChild className="h-12 px-8 shadow-xl">
                <Link href="/dashboard">
                  Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25">
                <Car className="w-4 h-4" />
              </div>
              <span className="font-semibold text-foreground">Smart Parking</span>
            </div>
            
            <nav className="flex items-center gap-6">
              <Link href="/team" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Team</Link>
              <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
              <Link href="/enquiry" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
            </nav>
            
            <p className="text-sm text-muted-foreground">
              Built with Next.js and Neon PostgreSQL
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
