"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { CreditCard, Check, X, Clock } from 'lucide-react'
import type { TopupRequest } from '@/lib/db'

const statusColors: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  pending: 'default',
  approved: 'secondary',
  rejected: 'destructive',
}

export default function AdminTopupsPage() {
  const [requests, setRequests] = useState<TopupRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<TopupRequest | null>(null)
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [notes, setNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/topup?all=true')
      const data = await res.json()
      setRequests(data.requests || [])
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleProcess = async () => {
    if (!selectedRequest || !action) return

    setProcessing(true)
    try {
      const res = await fetch(`/api/topup/${selectedRequest.id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })

      if (!res.ok) throw new Error(`Failed to ${action} request`)
      toast.success(`Request ${action}d successfully`)
      setSelectedRequest(null)
      setAction(null)
      setNotes('')
      fetchRequests()
    } catch (error) {
      toast.error(`Failed to ${action} request`)
    } finally {
      setProcessing(false)
    }
  }

  const openDialog = (request: TopupRequest, actionType: 'approve' | 'reject') => {
    setSelectedRequest(request)
    setAction(actionType)
    setNotes('')
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const pendingRequests = requests.filter((r) => r.status === 'pending')
  const processedRequests = requests.filter((r) => r.status !== 'pending')

  const RequestsTable = ({ data, showActions = false }: { data: TopupRequest[]; showActions?: boolean }) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Requested</TableHead>
            {showActions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((request) => (
            <TableRow key={request.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{request.user_name}</p>
                  <p className="text-sm text-muted-foreground">{request.user_email}</p>
                </div>
              </TableCell>
              <TableCell className="font-semibold text-foreground">
                ${Number(request.amount).toFixed(2)}
              </TableCell>
              <TableCell className="capitalize">{request.payment_method.replace('_', ' ')}</TableCell>
              <TableCell>
                <Badge variant={statusColors[request.status]}>{request.status}</Badge>
              </TableCell>
              <TableCell>{formatDate(request.created_at)}</TableCell>
              {showActions && (
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => openDialog(request, 'approve')}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openDialog(request, 'reject')}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Top-up Requests</h1>
        <p className="text-muted-foreground mt-1">Manage credit top-up requests</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="processed">Processed ({processedRequests.length})</TabsTrigger>
        </TabsList>

        <Card className="mt-6">
          <CardContent className="pt-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <>
                <TabsContent value="pending" className="mt-0">
                  {pendingRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No Pending Requests</h3>
                      <p className="text-muted-foreground">All top-up requests have been processed</p>
                    </div>
                  ) : (
                    <RequestsTable data={pendingRequests} showActions />
                  )}
                </TabsContent>

                <TabsContent value="processed" className="mt-0">
                  {processedRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No processed requests</p>
                    </div>
                  ) : (
                    <RequestsTable data={processedRequests} />
                  )}
                </TabsContent>
              </>
            )}
          </CardContent>
        </Card>
      </Tabs>

      <Dialog open={!!selectedRequest && !!action} onOpenChange={() => { setSelectedRequest(null); setAction(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'Approve' : 'Reject'} Top-up Request
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.user_name} requested ${Number(selectedRequest?.amount).toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="mt-4">
            <Field>
              <FieldLabel>Notes (Optional)</FieldLabel>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={action === 'reject' ? 'Reason for rejection...' : 'Any notes...'}
                rows={3}
              />
            </Field>
            <Button
              onClick={handleProcess}
              disabled={processing}
              variant={action === 'approve' ? 'default' : 'destructive'}
              className="w-full"
            >
              {processing ? 'Processing...' : action === 'approve' ? 'Approve Request' : 'Reject Request'}
            </Button>
          </FieldGroup>
        </DialogContent>
      </Dialog>
    </div>
  )
}
