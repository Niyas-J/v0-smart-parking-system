import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export { sql }

// Types
export interface User {
  id: number
  name: string
  email: string
  password_hash: string
  role: 'user' | 'admin'
  credits: number
  vehicle_number: string | null
  phone: string | null
  created_at: Date
  updated_at: Date
}

export interface Slot {
  id: number
  slot_number: string
  floor: number
  slot_type: 'standard' | 'handicapped' | 'ev' | 'vip'
  /** Vehicle class zone for multi-deck UX (optional in DB; inferred when missing). */
  zone?: 'bike' | 'car' | 'suv' | string | null
  status: 'available' | 'occupied' | 'reserved' | 'maintenance'
  hourly_rate: number
  created_at: Date
}

export interface Booking {
  id: number
  user_id: number
  slot_id: number
  vehicle_number: string
  start_time: Date
  end_time: Date | null
  status: 'active' | 'completed' | 'cancelled' | 'expired'
  total_cost: number
  created_at: Date
  updated_at: Date
  // Joined fields
  slot_number?: string
  slot_type?: string
  hourly_rate?: number
  floor?: number
  user_name?: string
  user_email?: string
}

export interface Transaction {
  id: number
  user_id: number
  booking_id: number | null
  type: 'topup' | 'payment' | 'refund' | 'penalty'
  amount: number
  balance_after: number
  description: string
  created_at: Date
}

export interface TopupRequest {
  id: number
  user_id: number
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  payment_method: string
  proof_url: string | null
  admin_notes: string | null
  created_at: Date
  processed_at: Date | null
  processed_by: number | null
  // Joined fields
  user_name?: string
  user_email?: string
}

export interface Alert {
  id: number
  user_id: number
  type: 'booking_reminder' | 'low_balance' | 'booking_expired' | 'system' | 'promo'
  title: string
  message: string
  is_read: boolean
  created_at: Date
  image_url?: string | null
}

export interface Ticket {
  id: number
  user_id: number
  subject: string
  message: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  admin_response: string | null
  created_at: Date
  updated_at: Date
  // Joined fields
  user_name?: string
  user_email?: string
}
