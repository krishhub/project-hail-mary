# ReelVault 🎬

Automatically capture every YouTube Reel / Short and Instagram Reel you share with yourself on WhatsApp, then categorize them in a beautiful dashboard.

---

## How it works

```
You share a link → WhatsApp → Whapi.cloud → /api/webhook → Supabase → Dashboard
```

1. You forward/send any YouTube or Instagram URL to **your own WhatsApp number**.
2. Whapi.cloud captures the message and fires a webhook to this app.
3. The app fetches metadata (title, thumbnail) and stores the reel in Supabase.
4. Open the dashboard → assign categories, mark watched, star favorites.

---

## Setup (one-time, ~20 min)

### 1. Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** → paste the contents of `supabase/schema.sql` → Run.
3. In **Project Settings → API**, copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Whapi.cloud

1. Sign up at [whapi.cloud](https://whapi.cloud) (free trial available).
2. Create a **Channel** and scan the QR code with your WhatsApp.
3. In your channel settings → **Webhooks**:
   - URL: `https://your-app.vercel.app/api/webhook`
   - Add header: `x-webhook-secret` → any secret string you choose
   - Enable event: **Messages**
4. Copy your **Channel Token** → `WHAPI_TOKEN`
5. Set your chosen secret string → `WEBHOOK_SECRET`

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
WHAPI_TOKEN=your-channel-token
WEBHOOK_SECRET=my-super-secret-string
```

### 4. Deploy to Vercel

```bash
# Install dependencies
npm install

# Push to GitHub, then in Vercel dashboard:
# - Import repo
# - Add all env vars from .env.local
# - Deploy
```

Or deploy from CLI:

```bash
npm i -g vercel
vercel --prod
```

After deploy, go back to Whapi.cloud and update the webhook URL to your `*.vercel.app` domain.

---

## Local development

```bash
npm install
npm run dev
# open http://localhost:3000
```

---

## Features

| Feature | Detail |
|---|---|
| Auto-capture | WhatsApp → webhook → saved instantly |
| Metadata | YouTube: title + thumbnail auto-fetched. Instagram: URL saved (Instagram blocks scraping) |
| Categories | Create color-coded categories, assign per reel |
| Filters | By category, platform, favorites, unwatched |
| Search | Full-text search by title |
| Watched / Favorite | Toggle per card |
| Add manually | Paste any URL directly in the dashboard |

---

## Tech stack

- **Next.js 14** (App Router) — framework
- **Supabase** (Postgres) — database
- **Whapi.cloud** — WhatsApp webhook connector
- **Tailwind CSS** — styling
- **Vercel** — hosting
