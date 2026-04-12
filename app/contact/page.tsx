'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'
import { toast } from 'sonner'
import { Mail, Phone, Send, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !query) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, query }),
      })
      if (!res.ok) throw new Error('Submission failed')
      
      toast.success('Your enquiry has been submitted. We will get back to you shortly.')
      setName('')
      setEmail('')
      setQuery('')
    } catch (err) {
      toast.error('Failed to submit your enquiry.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen ambient-app-bg text-foreground">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            Smart Parking Contact
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-white mb-2">Get in Touch</h1>
            <p className="text-muted-foreground text-lg">
              Have questions about your booking or our smart parking system? Send us a message and we'll get back to you within 24 hours.
            </p>
          </div>

          <div className="space-y-4">
            <Card className="glass-panel border-white/10 bg-white/5">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Email Support</h3>
                  <a href="mailto:niyas@kvgce.ac.in" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    niyas@kvgce.ac.in
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel border-white/10 bg-white/5">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/20 text-orange-400">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Phone Support</h3>
                  <a href="tel:8217469646" className="text-orange-400 hover:text-orange-300 transition-colors">
                    +91 8217469646
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex-1">
          <Card className="glass-panel-strong border-white/10 p-6 neon-ring h-full">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-2xl">Send an Enquiry</CardTitle>
              <CardDescription>We'd love to hear from you.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0 space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Field>
                  <FieldLabel>Name</FieldLabel>
                  <Input 
                    placeholder="Your name" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    className="bg-black/30 border-white/10"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input 
                    type="email" 
                    placeholder="you@example.com" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    className="bg-black/30 border-white/10"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel>Message</FieldLabel>
                  <textarea 
                    className="flex min-h-[120px] w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="How can we help?"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    required
                  />
                </Field>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full gap-2 transition-all duration-300 hover:scale-[1.02] bg-primary text-primary-foreground shadow-[0_0_24px_-4px_var(--primary)]"
                >
                  {loading ? 'Sending...' : 'Send Message'} <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
