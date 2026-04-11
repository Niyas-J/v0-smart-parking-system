import { cookies } from 'next/headers'
import { sql, User } from './db'
import bcrypt from 'bcryptjs'

const SESSION_COOKIE = 'parking_session'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: number): Promise<string> {
  const sessionId = crypto.randomUUID()
  const cookieStore = await cookies()
  
  cookieStore.set(SESSION_COOKIE, `${userId}:${sessionId}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
  
  return sessionId
}

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  
  if (!session?.value) {
    return null
  }
  
  const [userId] = session.value.split(':')
  
  if (!userId) {
    return null
  }
  
  const users = await sql`SELECT * FROM users WHERE id = ${parseInt(userId)}`
  
  if (users.length === 0) {
    return null
  }
  
  return users[0] as User
}

export async function requireAuth(): Promise<User> {
  const user = await getSession()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  return user
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth()
  
  if (user.role !== 'admin') {
    throw new Error('Forbidden')
  }
  
  return user
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function login(email: string, password: string): Promise<User | null> {
  const users = await sql`SELECT * FROM users WHERE email = ${email}`
  
  if (users.length === 0) {
    return null
  }
  
  const user = users[0] as User
  const isValid = await verifyPassword(password, user.password_hash)
  
  if (!isValid) {
    return null
  }
  
  await createSession(user.id)
  return user
}

export async function register(
  name: string,
  email: string,
  password: string,
  vehicleNumber?: string,
  phone?: string
): Promise<User | null> {
  const existing = await sql`SELECT id FROM users WHERE email = ${email}`
  
  if (existing.length > 0) {
    return null
  }
  
  const passwordHash = await hashPassword(password)
  
  const result = await sql`
    INSERT INTO users (name, email, password_hash, vehicle_number, phone)
    VALUES (${name}, ${email}, ${passwordHash}, ${vehicleNumber || null}, ${phone || null})
    RETURNING *
  `
  
  if (result.length === 0) {
    return null
  }
  
  const user = result[0] as User
  await createSession(user.id)
  return user
}
