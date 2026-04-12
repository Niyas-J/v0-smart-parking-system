# 📱 Test on Phone - Instructions

## Your Computer's IP: 192.168.1.7

## Step 1: Start Server with Network Access

On your computer, run:
```bash
npm run dev:network
```

This will start the server accessible from other devices on your network.

## Step 2: Connect Phone to Same WiFi

Make sure your phone is on the **SAME WiFi network** as your computer.

## Step 3: Open on Phone

On your phone's browser, go to:
```
http://192.168.1.7:3000
```

## Step 4: Login

- Email: `admin@parking.com`
- Password: `admin123`

## Step 5: Test ANPR

Go to: `http://192.168.1.7:3000/admin/anpr`

Click "Start Camera" - it will use your phone's camera!

---

## ⚠️ Important Notes

### Camera Won't Work Because:
**HTTP is not secure!** Browsers require HTTPS for camera access.

### Solutions:

#### Option 1: Use ngrok (Recommended)
1. Install ngrok: https://ngrok.com/download
2. Run: `ngrok http 3000`
3. You'll get a URL like: `https://abc123.ngrok.io`
4. Open that URL on your phone (HTTPS ✅)
5. Camera will work!

#### Option 2: Deploy to Vercel
- Already has HTTPS
- Access from anywhere
- Camera works perfectly

#### Option 3: Self-Signed Certificate (Advanced)
- Create local HTTPS certificate
- More complex setup
- Not recommended for testing

---

## Quick Test with ngrok

### Install ngrok:
```bash
# Download from https://ngrok.com/download
# Or use snap:
sudo snap install ngrok
```

### Run ngrok:
```bash
ngrok http 3000
```

### You'll see:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

### Open on Phone:
```
https://abc123.ngrok.io/admin/anpr
```

**Camera will work!** ✅

---

## Why Camera Needs HTTPS

Browsers block camera/microphone on HTTP for security:
- ✅ `https://` - Camera works
- ✅ `localhost` - Camera works (exception)
- ❌ `http://192.168.x.x` - Camera blocked
- ❌ `http://` - Camera blocked

---

## Alternative: Test on Computer First

1. Open on computer: `http://localhost:3000/admin/anpr`
2. Use computer's webcam
3. Test the OCR and validation
4. Once working, deploy to Vercel for phone testing

---

## Summary

**For Local Phone Testing:**
- Use ngrok to get HTTPS URL
- Or deploy to Vercel

**For Computer Testing:**
- Use localhost:3000 (works without HTTPS)
