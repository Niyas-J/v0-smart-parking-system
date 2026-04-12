'use client'

import { useMemo } from 'react'
import type { Slot } from '@/lib/db'
import { cn } from '@/lib/utils'
import { inferParkingZone } from '@/lib/slot-zone'

type SlotRow = Slot & { zone?: string | null }

function isBooked(status: Slot['status']) {
  return status === 'occupied' || status === 'reserved'
}

export function ParkingLot2D({
  slots,
  selectedSlot,
  onSelectSlot,
  className,
}: {
  slots: SlotRow[]
  selectedSlot: Slot | null
  onSelectSlot: (slot: SlotRow) => void
  className?: string
}) {
  const selectedId = selectedSlot?.id ?? null

  const topRow = slots.slice(0, Math.ceil(slots.length / 2))
  const bottomRow = slots.slice(Math.ceil(slots.length / 2))

  const renderSlot = (slot: SlotRow, rowIndex: number) => {
    const booked = isBooked(slot.status)
    const available = slot.status === 'available'
    const maintenance = slot.status === 'maintenance'
    const selected = selectedId === slot.id

    return (
      <button
        key={slot.id}
        type="button"
        disabled={!available}
        onClick={() => available && onSelectSlot(slot)}
        className={cn(
          'relative w-16 h-28 border-2 rounded-md transition-all duration-300 flex flex-col items-center justify-center p-2',
          rowIndex === 0 ? 'border-b-0 rounded-b-none' : 'border-t-0 rounded-t-none', // open side faces the road
          available ? 'border-emerald-500/50 hover:bg-emerald-500/20 hover:border-emerald-400 cursor-pointer' : '',
          booked ? 'border-rose-500/50 bg-rose-500/10 cursor-not-allowed' : '',
          maintenance ? 'border-slate-500/50 bg-slate-500/20 cursor-not-allowed' : '',
          selected && 'ring-2 ring-violet-500 bg-violet-500/20 border-violet-400 border-2'
        )}
      >
        <span className={cn(
          "absolute right-2 font-mono text-xs opacity-50",
          rowIndex === 0 ? "top-2" : "bottom-2"
        )}>
          {slot.slot_number.split('-')[1] || slot.slot_number}
        </span>
        
        {booked && (
          <div className={cn(
            "w-10 h-16 rounded-md shadow-lg",
            inferParkingZone(slot) === 'bike' ? 'w-6 h-12 bg-cyan-400' :
            inferParkingZone(slot) === 'suv' ? 'w-12 h-20 bg-orange-400' :
            'bg-blue-400'
          )}>
            {/* simple car roof representation */}
            <div className="w-full h-full bg-black/20 rounded-md border border-white/10" />
          </div>
        )}
      </button>
    )
  }

  return (
    <div
      className={cn(
        'relative w-full overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/80 shadow-[0_0_60px_-12px_rgba(56,189,248,0.15)] flex justify-center py-12',
        className,
      )}
    >
      <div className="flex flex-col gap-12 min-w-max px-8">
        {/* Top slots */}
        <div className="flex gap-2 relative">
           {topRow.map((slot) => renderSlot(slot, 0))}
           <div className="absolute -bottom-6 left-0 right-0 h-0.5 bg-yellow-500/30 border-t border-dashed border-yellow-500/50" />
        </div>

        {/* Bottom slots */}
        <div className="flex gap-2 relative">
           <div className="absolute -top-6 left-0 right-0 h-0.5 bg-yellow-500/30 border-t border-dashed border-yellow-500/50" />
           {bottomRow.map((slot) => renderSlot(slot, 1))}
        </div>
      </div>
    </div>
  )
}
