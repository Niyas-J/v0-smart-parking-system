import type { Slot } from '@/lib/db'

export type ParkingZone = 'bike' | 'car' | 'suv'

export function inferParkingZone(slot: Slot & { zone?: string | null }): ParkingZone {
  const z = slot.zone?.toLowerCase()
  if (z === 'bike' || z === 'car' || z === 'suv') return z
  const m = ((Number(slot.id) - 1) % 3 + 3) % 3
  if (m === 0) return 'bike'
  if (m === 1) return 'car'
  return 'suv'
}

export function enrichSlot(row: Slot): Slot & { zone: ParkingZone } {
  return { ...row, zone: inferParkingZone(row) }
}

export function enrichSlots(rows: Slot[]) {
  return rows.map(enrichSlot)
}

export function withParkingZone<T extends Slot>(slot: T): T & { parking_zone: ParkingZone } {
  return { ...slot, parking_zone: inferParkingZone(slot) }
}
