# Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free tier works)
- Neon database (already set up)

## Step 1: Prepare for Deployment

### 1.1 Check Git Status
```bash
git status
```

### 1.2 Commit All Changes
```bash
git add .
git commit -m "Fix authentication and database schema"
git push origin main
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
```bash
npm i -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
vercel
```

4. **Add Environment Variables**:
```bash
vercel env add DATABASE_URL
# Paste your Neon database URL when prompted
# Choose: Production, Preview, Development (select all)

vercel env add GUEST_USER_ID
# Enter: 2
# Choose: Production, Preview, Development (select all)
```

5. **Deploy to Production**:
```bash
vercel --prod
```

### Option B: Deploy via Vercel Dashboard

1. **Go to** [vercel.com](https://vercel.com)

2. **Click "Add New Project"**

3. **Import your GitHub repository**:
   - Select: `v0-smart-parking-system`

4. **Configure Project**:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

5. **Add Environment Variables**:
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_cfjiJK5D1nlu@ep-spring-hat-annsp0tx.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require
   GUEST_USER_ID=2
   ```

6. **Click "Deploy"**

## Step 3: Run Migrations on Production

After deployment, you need to run migrations on your production database:

### Option 1: Using Vercel CLI
```bash
vercel env pull .env.production
node scripts/run-migrations.js
```

### Option 2: Using Neon SQL Editor
1. Go to [Neon Console](https://console.neon.tech)
2. Select your database
3. Open SQL Editor
4. Copy and paste the contents of `scripts/001-create-tables.sql`
5. Click "Run"

## Step 4: Verify Deployment

1. **Visit your deployed URL** (e.g., `https://your-app.vercel.app`)

2. **Test authentication**:
   - Try accessing `/dashboard` without login → should redirect to `/login`
   - Login with: `admin@parking.com` / `admin123`
   - Access `/admin` → should work
   - Logout and login as: `john@example.com` / `user123`
   - Try accessing `/admin` → should redirect to `/dashboard`

## Step 5: Set Up Automatic Deployments

Vercel automatically deploys when you push to GitHub:
- Push to `main` branch → Production deployment
- Push to other branches → Preview deployment

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- TypeScript errors are ignored (see `next.config.mjs`)

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly in Vercel
- Check Neon database is active
- Ensure connection string includes `?sslmode=require`

### Authentication Not Working
- Clear browser cookies
- Check that migrations ran successfully
- Verify `password_hash` column exists in users table

## Environment Variables Reference

```env
# Required
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Optional
GUEST_USER_ID=2
NODE_ENV=production
```

## Post-Deployment

### Custom Domain (Optional)
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Monitoring
- View logs: Vercel Dashboard → Your Project → Deployments → Logs
- Analytics: Vercel Dashboard → Your Project → Analytics

## Quick Deploy Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# Open project in browser
vercel open
```

## Default Credentials

After deployment, you can login with:
- **Admin**: `admin@parking.com` / `admin123`
- **User**: `john@example.com` / `user123`

**⚠️ Important**: Change these default passwords in production!
