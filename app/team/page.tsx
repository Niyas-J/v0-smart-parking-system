'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Car, 
  ArrowLeft,
  Github,
  Linkedin,
  Mail
} from 'lucide-react'

const teamMembers = [
  {
    name: 'Niyas Jahangeer',
    role: 'Project Lead & Full Stack Developer',
    bio: 'Leading the development of Smart Parking System with expertise in Next.js, React, and database design.',
    avatar: 'NJ',
    color: 'from-blue-500 to-blue-600',
    links: {
      github: '#',
      linkedin: '#',
      email: 'niyas@smartparking.com'
    }
  },
  {
    name: 'Alex Chen',
    role: 'Backend Developer',
    bio: 'Specializes in API development, database optimization, and server-side architecture.',
    avatar: 'AC',
    color: 'from-purple-500 to-purple-600',
    links: {
      github: '#',
      linkedin: '#',
      email: 'alex@smartparking.com'
    }
  },
  {
    name: 'Sarah Miller',
    role: 'UI/UX Designer',
    bio: 'Creates intuitive and beautiful user interfaces with a focus on accessibility and user experience.',
    avatar: 'SM',
    color: 'from-pink-500 to-pink-600',
    links: {
      github: '#',
      linkedin: '#',
      email: 'sarah@smartparking.com'
    }
  },
  {
    name: 'David Park',
    role: 'DevOps Engineer',
    bio: 'Manages deployment pipelines, cloud infrastructure, and ensures system reliability.',
    avatar: 'DP',
    color: 'from-green-500 to-green-600',
    links: {
      github: '#',
      linkedin: '#',
      email: 'david@smartparking.com'
    }
  },
]

export default function TeamPage() {
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
      <section className="pt-36 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto text-center relative">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
            Meet Our <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Team</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            We&apos;re a passionate group of developers, designers, and engineers dedicated to revolutionizing the parking experience.
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <Card 
                key={index}
                className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-white/30 dark:border-slate-700/50 shadow-xl shadow-black/5 hover:shadow-2xl transition-all duration-300 overflow-hidden group"
              >
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className={`flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform`}>
                      {member.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-foreground">{member.name}</h3>
                      <p className="text-sm text-primary font-medium mt-1">{member.role}</p>
                      <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{member.bio}</p>
                      
                      <div className="flex items-center gap-3 mt-4">
                        <a 
                          href={member.links.github}
                          className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                        <a 
                          href={member.links.linkedin}
                          className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                        <a 
                          href={`mailto:${member.links.email}`}
                          className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-blue-500 to-purple-600 border-0 shadow-xl overflow-hidden">
            <CardContent className="p-12 text-center text-white">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Join Our Team</h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                We&apos;re always looking for talented individuals to join our mission of making parking smarter and easier.
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/enquiry">Get in Touch</Link>
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
          <p className="text-sm text-muted-foreground">Built with passion by our team</p>
        </div>
      </footer>
    </div>
  )
}
