# OACIntel — Deployment Guide

## Files in this project
```
oacintel/
├── app/
│   ├── layout.js          ← Page wrapper & fonts
│   ├── page.js            ← Homepage
│   ├── globals.css        ← Base styles
│   └── api/
│       └── send-email/
│           └── route.js   ← Email API (uses Resend)
├── components/
│   └── OACIntel.js        ← The full app
├── .gitignore
├── .env.local.example     ← Copy this, rename to .env.local
├── next.config.js
└── package.json
```

## Deploy to Vercel in 10 minutes

### Step 1 — GitHub
1. Go to github.com and create a new repository called `oacintel`
2. Upload ALL these files keeping the same folder structure
3. Make it Public

### Step 2 — Vercel
1. Go to vercel.com → Sign up / Log in
2. Click "Add New Project"
3. Import your `oacintel` GitHub repository
4. Click Deploy — it will build automatically

### Step 3 — Add your Resend API key
1. In Vercel → go to your project → Settings → Environment Variables
2. Add: `RESEND_API_KEY` = your key from resend.com
3. Redeploy (Vercel → Deployments → three dots → Redeploy)

### Step 4 — Connect your GoDaddy domain
1. In Vercel → your project → Settings → Domains
2. Add your domain e.g. `oacintel.com`
3. Vercel will show you two DNS records to add
4. Go to GoDaddy → My Products → DNS → Add those records
5. Wait 10-30 minutes → your site is live

### Step 5 — Set up Resend domain
1. Go to resend.com → Domains → Add Domain → type `oacintel.com`
2. Add the DNS records they give you in GoDaddy
3. Now emails will send from intel@oacintel.com

## Admin access
- Visit your site
- Scroll to the very bottom
- Click the tiny ◈ ADMIN button
- Password: oac2024 (change this in OACIntel.js line 3)
