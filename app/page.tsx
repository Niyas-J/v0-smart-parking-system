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
  CheckCircle
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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
                <Car className="w-5 h-5" />
              </div>
              <span className="font-semibold text-foreground text-lg">Smart Parking</span>
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight text-balance">
            Parking Made
            <span className="text-primary"> Simple</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Find, book, and pay for parking in seconds. No more searching for spots or fumbling for change.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/register">
                Start Parking <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Demo: Use john@example.com or admin@parking.com with any password
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
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
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-4">
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
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="pt-6">
                  <p className="text-4xl font-bold">20+</p>
                  <p className="text-sm opacity-80 mt-1">Parking Slots</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-4xl font-bold text-foreground">24/7</p>
                  <p className="text-sm text-muted-foreground mt-1">Available</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-4xl font-bold text-foreground">$2</p>
                  <p className="text-sm text-muted-foreground mt-1">Starting Rate/hr</p>
                </CardContent>
              </Card>
              <Card className="bg-accent/20">
                <CardContent className="pt-6">
                  <p className="text-4xl font-bold text-foreground">4</p>
                  <p className="text-sm text-muted-foreground mt-1">Slot Types</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Park Smarter?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Join thousands of drivers who have simplified their parking experience.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/register">
              Create Free Account <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
              <Car className="w-4 h-4" />
            </div>
            <span className="font-semibold text-foreground">Smart Parking</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with Next.js and Neon PostgreSQL
          </p>
        </div>
      </footer>
    </div>
  )
}
