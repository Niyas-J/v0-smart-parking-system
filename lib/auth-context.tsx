"use client"

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'

interface User {
  id: number
  name: string
  email: string
  role: 'user' | 'admin'
  credits: number
  vehicle_number: string | null
  phone: string | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: { name: string; email: string; password: string; vehicleNumber?: string; phone?: string }) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Default guest user for direct dashboard access
const guestUser: User = {
  id: 0,
  name: 'Guest User',
  email: 'guest@smartparking.com',
  role: 'user',
  credits: 1000,
  vehicle_number: 'GUEST-001',
  phone: null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      // If no authenticated user, use guest user for demo access
      setUser(data.user || guestUser)
    } catch {
      // Allow guest access on error
      setUser(guestUser)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        return { success: false, error: data.error }
      }

      setUser(data.user)
      return { success: true }
    } catch {
      return { success: false, error: 'An error occurred' }
    }
  }

  const register = async (data: { name: string; email: string; password: string; vehicleNumber?: string; phone?: string }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()

      if (!res.ok) {
        return { success: false, error: result.error }
      }

      setUser(result.user)
      return { success: true }
    } catch {
      return { success: false, error: 'An error occurred' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
