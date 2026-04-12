# Database Setup

## Prerequisites
- Neon Postgres account (https://neon.tech)
- Database URL in `.env.local`

## Setup Steps

1. **Create a Neon database** and get your connection string

2. **Add to `.env.local`**:
   ```
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   ```

3. **Run migrations**:
   ```bash
   npm run migrate
   # or manually:
   node scripts/run-migrations.js
   ```

## Default Credentials

After running migrations, you can login with:

**Admin Account:**
- Email: `admin@parking.com`
- Password: `admin123`

**User Account:**
- Email: `john@example.com`
- Password: `user123`

## Database Schema

- **users** - User accounts with roles (user/admin), credits, vehicle info
- **slots** - Parking slots with floor, type, zone, status, hourly rate
- **bookings** - Active and historical parking sessions
- **transactions** - Credit transaction history
- **topup_requests** - Pending credit top-up requests
- **alerts** - User notifications
- **tickets** - Support tickets

## Authentication

The app uses:
- Cookie-based sessions (`parking_session`)
- bcrypt password hashing
- Server-side route protection via layouts
- API route guards with `requireAuth()` and `requireAdmin()`

## Route Protection

All protected routes check authentication server-side:
- `/dashboard/*` - Requires login
- `/admin/*` - Requires admin role
- `/book` - Requires login
- `/login`, `/register` - Redirects to dashboard if already logged in
