"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, ParkingCircle } from 'lucide-react'
import type { Slot } from '@/lib/db'

const statusColors: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  available: 'default',
  occupied: 'destructive',
  reserved: 'secondary',
  maintenance: 'outline',
}

export default function AdminSlotsPage() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [editSlot, setEditSlot] = useState<Slot | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    slot_number: '',
    floor: '1',
    slot_type: 'standard',
    status: 'available',
    hourly_rate: '2.00',
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchSlots = async () => {
    try {
      const res = await fetch('/api/slots')
      const data = await res.json()
      setSlots(data.slots || [])
    } catch (error) {
      console.error('Error fetching slots:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSlots()
  }, [])

  const openCreate = () => {
    setEditSlot(null)
    setFormData({
      slot_number: '',
      floor: '1',
      slot_type: 'standard',
      status: 'available',
      hourly_rate: '2.00',
    })
    setDialogOpen(true)
  }

  const openEdit = (slot: Slot) => {
    setEditSlot(slot)
    setFormData({
      slot_number: slot.slot_number,
      floor: String(slot.floor),
      slot_type: slot.slot_type,
      status: slot.status,
      hourly_rate: String(slot.hourly_rate),
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.slot_number.trim()) {
      toast.error('Slot number is required')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        slot_number: formData.slot_number,
        floor: parseInt(formData.floor),
        slot_type: formData.slot_type,
        status: formData.status,
        hourly_rate: parseFloat(formData.hourly_rate),
      }

      if (editSlot) {
        const res = await fetch(`/api/slots/${editSlot.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Failed to update slot')
        toast.success('Slot updated successfully')
      } else {
        const res = await fetch('/api/slots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Failed to create slot')
        toast.success('Slot created successfully')
      }

      setDialogOpen(false)
      fetchSlots()
    } catch (error) {
      toast.error(editSlot ? 'Failed to update slot' : 'Failed to create slot')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (slotId: number) => {
    if (!confirm('Are you sure you want to delete this slot?')) return

    try {
      const res = await fetch(`/api/slots/${slotId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete slot')
      toast.success('Slot deleted successfully')
      fetchSlots()
    } catch (error) {
      toast.error('Failed to delete slot')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Slots</h1>
          <p className="text-muted-foreground mt-1">Configure parking slots</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Slot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editSlot ? 'Edit Slot' : 'Add New Slot'}</DialogTitle>
              <DialogDescription>
                {editSlot ? 'Update slot details' : 'Create a new parking slot'}
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="mt-4">
              <Field>
                <FieldLabel>Slot Number</FieldLabel>
                <Input
                  value={formData.slot_number}
                  onChange={(e) => setFormData({ ...formData, slot_number: e.target.value })}
                  placeholder="A1"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Floor</FieldLabel>
                  <Select value={formData.floor} onValueChange={(v) => setFormData({ ...formData, floor: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((f) => (
                        <SelectItem key={f} value={String(f)}>Floor {f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Type</FieldLabel>
                  <Select value={formData.slot_type} onValueChange={(v) => setFormData({ ...formData, slot_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="handicapped">Handicapped</SelectItem>
                      <SelectItem value="ev">EV Charging</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Status</FieldLabel>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Hourly Rate ($)</FieldLabel>
                  <Input
                    type="number"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                    step="0.50"
                    min="0"
                  />
                </Field>
              </div>
              <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                {submitting ? 'Saving...' : editSlot ? 'Update Slot' : 'Create Slot'}
              </Button>
            </FieldGroup>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-12">
              <ParkingCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Slots</h3>
              <p className="text-muted-foreground mb-4">Get started by adding your first parking slot</p>
              <Button onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Add Slot
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Slot</TableHead>
                    <TableHead>Floor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots.map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell className="font-medium">{slot.slot_number}</TableCell>
                      <TableCell>{slot.floor}</TableCell>
                      <TableCell className="capitalize">{slot.slot_type}</TableCell>
                      <TableCell>
                        <Badge variant={statusColors[slot.status]}>{slot.status}</Badge>
                      </TableCell>
                      <TableCell>${Number(slot.hourly_rate).toFixed(2)}/hr</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(slot)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(slot.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
