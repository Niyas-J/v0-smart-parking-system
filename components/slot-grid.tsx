"use client"

import { cn } from '@/lib/utils'
import type { Slot } from '@/lib/db'
import { Car, Zap, Accessibility, Crown, Wrench } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface SlotGridProps {
  slots: Slot[]
  selectedSlot?: Slot | null
  onSelectSlot?: (slot: Slot) => void
  showLegend?: boolean
}

const statusColors: Record<string, string> = {
  available: 'bg-emerald-500 hover:bg-emerald-600 cursor-pointer',
  occupied: 'bg-rose-500 cursor-not-allowed',
  reserved: 'bg-blue-500 cursor-not-allowed',
  maintenance: 'bg-gray-500 cursor-not-allowed',
}

const typeIcons: Record<string, React.ReactNode> = {
  standard: <Car className="w-5 h-5" />,
  ev: <Zap className="w-5 h-5" />,
  handicapped: <Accessibility className="w-5 h-5" />,
  vip: <Crown className="w-5 h-5" />,
}

export function SlotGrid({ slots, selectedSlot, onSelectSlot, showLegend = true }: SlotGridProps) {
  // Group slots by floor
  const slotsByFloor = slots.reduce((acc, slot) => {
    const floor = slot.floor || 1
    if (!acc[floor]) acc[floor] = []
    acc[floor].push(slot)
    return acc
  }, {} as Record<number, Slot[]>)

  const floors = Object.keys(slotsByFloor).map(Number).sort()

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {showLegend && (
          <div className="flex flex-wrap gap-4 p-4 bg-secondary/30 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[oklch(var(--slot-available))]" />
              <span className="text-sm text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[oklch(var(--slot-occupied))]" />
              <span className="text-sm text-muted-foreground">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[oklch(var(--slot-reserved))]" />
              <span className="text-sm text-muted-foreground">Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[oklch(var(--slot-maintenance))]" />
              <span className="text-sm text-muted-foreground">Maintenance</span>
            </div>
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">EV</span>
            </div>
            <div className="flex items-center gap-2">
              <Accessibility className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Accessible</span>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">VIP</span>
            </div>
          </div>
        )}

        {floors.map((floor) => (
          <div key={floor}>
            <h3 className="text-lg font-semibold text-foreground mb-4">Floor {floor}</h3>
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {slotsByFloor[floor].map((slot) => {
                const isSelected = selectedSlot?.id === slot.id
                const isAvailable = slot.status === 'available'
                const isMaintenance = slot.status === 'maintenance'

                return (
                  <Tooltip key={slot.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => isAvailable && onSelectSlot?.(slot)}
                        disabled={!isAvailable}
                        className={cn(
                          "relative flex flex-col items-center justify-center p-3 rounded-xl transition-all",
                          "min-h-[80px] text-white",
                          statusColors[slot.status],
                          isSelected && "ring-2 ring-offset-2 ring-foreground",
                          isAvailable && "hover:scale-105"
                        )}
                      >
                        {isMaintenance ? (
                          <Wrench className="w-5 h-5" />
                        ) : (
                          typeIcons[slot.slot_type] || typeIcons.standard
                        )}
                        <span className="text-sm font-semibold mt-1">{slot.slot_number}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm">
                        <p className="font-semibold">{slot.slot_number}</p>
                        <p className="capitalize">{slot.slot_type} - {slot.status}</p>
                        <p>${Number(slot.hourly_rate).toFixed(2)}/hr</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  )
}
