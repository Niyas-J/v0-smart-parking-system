# What is GUEST_USER_ID?

## Quick Answer
`GUEST_USER_ID=2` points to the demo user account (John Doe) in your database.

## What It Does
It's for a **guest/demo mode** feature that allows users to try the app without creating an account. The API endpoint `/api/auth/guest` can automatically log someone in as this user.

## Current Status
- ✅ The API endpoint exists: `/api/auth/guest`
- ❌ There's NO "Try as Guest" button in the UI currently
- 🤷 It's optional - the app works fine without it

## Should You Include It?

### Option 1: Include It (Recommended)
**Why:** It's already in your .env.local, won't hurt anything
```
GUEST_USER_ID=2
```

### Option 2: Skip It
**Why:** Not being used in the UI anyway
- Just don't add it to Vercel
- App will work perfectly fine

## If You Want to Add Guest Login Button

You could add this to the login page later:

```tsx
<Button 
  variant="outline" 
  onClick={async () => {
    await fetch('/api/auth/guest', { method: 'POST' })
    router.push('/dashboard')
  }}
>
  Try as Guest
</Button>
```

## Bottom Line
**For deployment, you can:**
- ✅ Add it (safe, no harm)
- ✅ Skip it (also fine)

**My recommendation:** Add it anyway since it's already configured. Takes 5 seconds and might be useful later.
