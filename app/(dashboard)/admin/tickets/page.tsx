"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { TicketIcon, MessageSquare } from 'lucide-react'
import type { Ticket } from '@/lib/db'

const statusColors: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  open: 'default',
  in_progress: 'secondary',
  resolved: 'outline',
  closed: 'outline',
}

const priorityColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  normal: 'bg-secondary text-secondary-foreground',
  high: 'bg-destructive/10 text-destructive',
  urgent: 'bg-destructive text-destructive-foreground',
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [status, setStatus] = useState('')
  const [response, setResponse] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets?all=true')
      const data = await res.json()
      setTickets(data.tickets || [])
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  const openTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setStatus(ticket.status)
    setResponse(ticket.admin_response || '')
  }

  const handleUpdate = async () => {
    if (!selectedTicket) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          admin_response: response || null,
        }),
      })

      if (!res.ok) throw new Error('Failed to update ticket')
      toast.success('Ticket updated successfully')
      setSelectedTicket(null)
      fetchTickets()
    } catch (error) {
      toast.error('Failed to update ticket')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const openTickets = tickets.filter((t) => ['open', 'in_progress'].includes(t.status))
  const closedTickets = tickets.filter((t) => ['resolved', 'closed'].includes(t.status))

  const TicketsList = ({ data }: { data: Ticket[] }) => (
    <div className="space-y-4">
      {data.map((ticket) => (
        <Card key={ticket.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => openTicket(ticket)}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-foreground">{ticket.subject}</h4>
                  <Badge variant={statusColors[ticket.status]}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {ticket.user_name} ({ticket.user_email})
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {ticket.message}
                </p>
              </div>
              <span className="text-xs text-muted-foreground ml-4">
                {formatDate(ticket.created_at)}
              </span>
            </div>
            {ticket.admin_response && (
              <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-primary">Response</span>
                </div>
                <p className="text-sm text-foreground line-clamp-2">{ticket.admin_response}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Support Tickets</h1>
        <p className="text-muted-foreground mt-1">Manage user support requests</p>
      </div>

      <Tabs defaultValue="open">
        <TabsList>
          <TabsTrigger value="open">Open ({openTickets.length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({closedTickets.length})</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : (
            <>
              <TabsContent value="open" className="mt-0">
                {openTickets.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-12">
                        <TicketIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No Open Tickets</h3>
                        <p className="text-muted-foreground">All support requests have been handled</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <TicketsList data={openTickets} />
                )}
              </TabsContent>

              <TabsContent value="closed" className="mt-0">
                {closedTickets.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-12">
                        <TicketIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No closed tickets</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <TicketsList data={closedTickets} />
                )}
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>

      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.subject}</DialogTitle>
            <DialogDescription>
              From {selectedTicket?.user_name} ({selectedTicket?.user_email})
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-lg bg-secondary/30">
              <p className="text-sm text-foreground whitespace-pre-wrap">{selectedTicket?.message}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {selectedTicket && formatDate(selectedTicket.created_at)}
              </p>
            </div>

            <FieldGroup>
              <Field>
                <FieldLabel>Status</FieldLabel>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Response</FieldLabel>
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Write your response to the user..."
                  rows={4}
                />
              </Field>
              <Button onClick={handleUpdate} disabled={submitting} className="w-full">
                {submitting ? 'Updating...' : 'Update Ticket'}
              </Button>
            </FieldGroup>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
