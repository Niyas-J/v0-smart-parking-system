# Username Display Issue - Debugging Guide

## Where Username Should Appear

1. **Dashboard Page** (`/dashboard`)
   - Header: "Welcome back, [FirstName]"
   
2. **Navigation Sidebar** (Desktop - left side)
   - Bottom section shows:
     - Full name
     - Email
     - Balance (for users)

3. **Mobile Menu** (Mobile - hamburger menu)
   - Same as sidebar

## Common Reasons Username Doesn't Show

### 1. User Data Not Loaded Yet
**Symptom:** Blank space where name should be

**Check:** Open browser DevTools (F12) → Console
Look for errors or check Network tab for `/api/auth/me` response

**Fix:** The AuthContext should handle this automatically

### 2. Not Logged In
**Symptom:** Redirected to login page

**Fix:** Login first!

### 3. Database Missing User Data
**Symptom:** Shows "undefined" or blank

**Check:** Run this to verify database has user data:
```bash
node scripts/verify-db.js
```

### 4. Browser Cache Issue
**Symptom:** Old data showing or no data

**Fix:**
- Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
- Clear browser cache
- Try incognito mode

## Quick Test

1. **Login** with:
   - Email: `admin@parking.com`
   - Password: `admin123`

2. **Check these locations:**
   - Top of dashboard page should say: "Welcome back, Admin"
   - Bottom of sidebar should show: "Admin" and "admin@parking.com"

3. **If still not showing:**
   - Open DevTools (F12)
   - Go to Console tab
   - Type: `localStorage` and `sessionStorage` to check
   - Go to Application → Cookies → Check for `parking_session`

## Debug Steps

### Step 1: Check if logged in
```javascript
// In browser console (F12)
fetch('/api/auth/me').then(r => r.json()).then(console.log)
```

Should return:
```json
{
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@parking.com",
    "role": "admin",
    "credits": 10000
  }
}
```

### Step 2: Check AuthContext
The `useAuth()` hook should provide:
- `user` object with name, email, etc.
- `loading` boolean
- If `loading` is true, data is still fetching

### Step 3: Check Database
```bash
cd /home/swordemon/Desktop/v0-smart-parking-system
node scripts/verify-db.js
```

Should show users with names.

## Most Likely Issue

**You need to login!** The username only shows when you're logged in.

Try this:
1. Go to `http://localhost:3000`
2. Login with `admin@parking.com` / `admin123`
3. Check if name appears

If it still doesn't show, there might be a React rendering issue. Check browser console for errors.
