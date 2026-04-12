# 🚀 ngrok Setup - Final Steps

## ✅ What's Done:
- ✅ ngrok downloaded to `/tmp/ngrok`
- ✅ Dev server running on port 3000
- ⚠️ Need to authenticate ngrok

## 🔑 Step 1: Get ngrok Auth Token

1. Go to: https://dashboard.ngrok.com/signup
2. Sign up (FREE account)
3. Go to: https://dashboard.ngrok.com/get-started/your-authtoken
4. Copy your authtoken (looks like: `2abc123def456...`)

## 🔧 Step 2: Configure ngrok

Run this command (replace YOUR_TOKEN with your actual token):

```bash
/tmp/ngrok config add-authtoken YOUR_TOKEN
```

Example:
```bash
/tmp/ngrok config add-authtoken 2abc123def456ghi789jkl
```

## 🚀 Step 3: Start ngrok

```bash
/tmp/ngrok http 3000
```

You'll see:
```
Session Status                online
Account                       your@email.com
Forwarding                    https://abc123.ngrok.io -> http://localhost:3000
```

## 📱 Step 4: Open on Phone

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`) and open it on your phone!

Then go to: `https://abc123.ngrok.io/admin/anpr`

**Camera will work!** ✅

---

## 🎯 Quick Commands

### Start Everything:
```bash
# Terminal 1: Dev server
cd /home/swordemon/Desktop/v0-smart-parking-system
npm run dev:network

# Terminal 2: ngrok
/tmp/ngrok http 3000
```

### Stop Everything:
```bash
# Stop dev server
kill $(cat /tmp/nextjs.pid)

# Stop ngrok
pkill ngrok
```

---

## 🆓 ngrok Free Tier:
- ✅ 1 online ngrok process
- ✅ 4 tunnels/ngrok process
- ✅ 40 connections/minute
- ✅ HTTPS included
- ✅ Perfect for testing!

---

## 📝 Summary

1. Sign up at ngrok.com (free)
2. Get your authtoken
3. Run: `/tmp/ngrok config add-authtoken YOUR_TOKEN`
4. Run: `/tmp/ngrok http 3000`
5. Open the HTTPS URL on your phone
6. Test camera at `/admin/anpr`

**That's it!** 🎉
