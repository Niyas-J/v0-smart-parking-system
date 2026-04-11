"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react'
import type { Transaction, TopupRequest } from '@/lib/db'

export default function WalletPage() {
  const { user, refreshUser } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [topupRequests, setTopupRequests] = useState<TopupRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [topupAmount, setTopupAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const [submitting, setSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchData = async () => {
    try {
      const [transRes, topupRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/topup'),
      ])

      const transData = await transRes.json()
      const topupData = await topupRes.json()

      setTransactions(transData.transactions || [])
      setTopupRequests(topupData.requests || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleTopup = async () => {
    const amount = parseFloat(topupAmount)
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, payment_method: paymentMethod }),
      })

      if (!res.ok) {
        throw new Error('Failed to submit request')
      }

      toast.success('Top-up request submitted successfully')
      setTopupAmount('')
      setDialogOpen(false)
      fetchData()
    } catch (error) {
      toast.error('Failed to submit top-up request')
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

  const quickAmounts = [10, 25, 50, 100]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Wallet</h1>
        <p className="text-muted-foreground mt-1">Manage your parking credits</p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-80">Available Balance</p>
              <p className="text-4xl font-bold mt-2">
                ${Number(user?.credits || 0).toFixed(2)}
              </p>
            </div>
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20">
              <Wallet className="w-7 h-7" />
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" className="mt-6">
                <Plus className="w-4 h-4 mr-2" />
                Top Up
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Top Up Your Wallet</DialogTitle>
                <DialogDescription>
                  Add credits to your parking wallet
                </DialogDescription>
              </DialogHeader>
              <FieldGroup className="mt-4">
                <div className="flex gap-2 flex-wrap">
                  {quickAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant={topupAmount === String(amount) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTopupAmount(String(amount))}
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
                <Field>
                  <FieldLabel>Amount ($)</FieldLabel>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    min="1"
                  />
                </Field>
                <Field>
                  <FieldLabel>Payment Method</FieldLabel>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="e_wallet">E-Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Button onClick={handleTopup} disabled={submitting} className="w-full">
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Your request will be reviewed by an admin
                </p>
              </FieldGroup>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Pending Top-ups */}
      {topupRequests.filter((r) => r.status === 'pending').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pending Top-ups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topupRequests
                .filter((r) => r.status === 'pending')
                .map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/30"
                  >
                    <div>
                      <p className="font-medium text-foreground">+${Number(request.amount).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {request.payment_method.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">Pending</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(request.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent wallet activity</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/30"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                        transaction.amount > 0
                          ? 'bg-accent/20 text-accent-foreground'
                          : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {transaction.amount > 0 ? (
                        <ArrowDownRight className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground capitalize">{transaction.type}</p>
                      <p className="text-sm text-muted-foreground">{transaction.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.amount > 0 ? 'text-accent-foreground' : 'text-destructive'
                      }`}
                    >
                      {transaction.amount > 0 ? '+' : ''}${Number(transaction.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(transaction.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
