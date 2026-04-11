'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Car, 
  ArrowLeft,
  ChevronDown,
  Search,
  MessageSquare
} from 'lucide-react'
import { Input } from '@/components/ui/input'

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        question: 'How do I create an account?',
        answer: 'Click on "Get Started" or "Create Account" on the homepage. Fill in your details including name, email, password, vehicle number, and phone. Once registered, you can start using the parking system immediately.'
      },
      {
        question: 'Can I use the system without creating an account?',
        answer: 'Yes! You can access the dashboard directly by clicking "Go to Dashboard" on the homepage. However, creating an account allows you to save your booking history, manage credits, and receive personalized notifications.'
      },
      {
        question: 'How do I add credits to my account?',
        answer: 'Navigate to the Wallet section in your dashboard. You can request a top-up by selecting an amount and submitting a request. Once approved by an admin, the credits will be added to your account.'
      }
    ]
  },
  {
    category: 'Booking & Parking',
    questions: [
      {
        question: 'How do I book a parking slot?',
        answer: 'Go to "Book Slot" in your dashboard. You\'ll see an interactive grid showing all available slots. Green slots are available - simply click on one to select it. Enter your vehicle number and confirm the booking.'
      },
      {
        question: 'What types of parking slots are available?',
        answer: 'We offer four types of slots: Standard ($2/hr), Handicapped ($1.50/hr), EV Charging ($3/hr), and VIP ($5/hr). Each slot type is color-coded in the booking grid for easy identification.'
      },
      {
        question: 'How do I end my parking session?',
        answer: 'Go to "My Bookings" in your dashboard. Find your active booking and click "End Parking". The system will calculate the total cost based on your parking duration and deduct it from your credits.'
      },
      {
        question: 'What if I overstay my parking time?',
        answer: 'Our system tracks parking duration automatically. You\'ll be charged for the exact time you parked. If your credits are low, you\'ll receive alerts to top up your balance.'
      }
    ]
  },
  {
    category: 'Payments & Credits',
    questions: [
      {
        question: 'How does the credit system work?',
        answer: 'Credits are like a digital wallet. You top up credits in advance, and they\'re automatically deducted when you end a parking session. This eliminates the need for cash or card payments at the lot.'
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept bank transfers and credit cards for top-ups. Simply submit a top-up request with your preferred amount and payment method. An admin will process your request promptly.'
      },
      {
        question: 'Can I get a refund?',
        answer: 'Yes, refunds are available for cancelled bookings or account closures. Contact our support team through the Support section in your dashboard to initiate a refund request.'
      }
    ]
  },
  {
    category: 'Account & Support',
    questions: [
      {
        question: 'How do I update my vehicle information?',
        answer: 'Your vehicle number is linked to your account during registration. To update it, contact our support team through the Support section in your dashboard with your new vehicle details.'
      },
      {
        question: 'I forgot my password. How do I reset it?',
        answer: 'On the login page, click "Forgot Password" and enter your registered email. You\'ll receive instructions to reset your password. If you don\'t receive the email, check your spam folder or contact support.'
      },
      {
        question: 'How do I contact support?',
        answer: 'You can reach us through the Support section in your dashboard by creating a ticket, or use the Contact page to send us an enquiry. We typically respond within 24 hours.'
      }
    ]
  }
]

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-900">
      {/* Header */}
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
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-36 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto text-center relative">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
            Frequently Asked <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Questions</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about Smart Parking. Can&apos;t find what you&apos;re looking for? Contact us!
          </p>
          
          {/* Search */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-base bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-white/30 dark:border-slate-700/50 rounded-2xl"
            />
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          {filteredFaqs.map((category, catIndex) => (
            <div key={catIndex}>
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-sm font-bold text-primary">
                  {category.questions.length}
                </span>
                {category.category}
              </h2>
              <div className="space-y-4">
                {category.questions.map((item, index) => {
                  const itemId = `${catIndex}-${index}`
                  const isOpen = openItems.includes(itemId)
                  
                  return (
                    <Card 
                      key={index}
                      className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-white/30 dark:border-slate-700/50 shadow-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(itemId)}
                        className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-white/40 dark:hover:bg-slate-700/40 transition-colors"
                      >
                        <span className="font-medium text-foreground">{item.question}</span>
                        <ChevronDown className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                        <CardContent className="pt-0 pb-6 px-6">
                          <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No results found for &quot;{searchQuery}&quot;</p>
              <Button variant="ghost" className="mt-4" onClick={() => setSearchQuery('')}>
                Clear search
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-white/30 dark:border-slate-700/50 shadow-xl">
            <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-semibold text-foreground">Still have questions?</h3>
                <p className="text-muted-foreground mt-1">Can&apos;t find the answer you&apos;re looking for? Please reach out to our team.</p>
              </div>
              <Button asChild className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25">
                <Link href="/enquiry">Contact Us</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <Car className="w-4 h-4" />
            </div>
            <span className="font-semibold text-foreground">Smart Parking</span>
          </Link>
          <p className="text-sm text-muted-foreground">Helping you park smarter</p>
        </div>
      </footer>
    </div>
  )
}
