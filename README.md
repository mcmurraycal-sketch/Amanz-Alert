# Amanz' Alert

Live, crowd-sourced water outage map for South Africa. Pilot region: Eastern Cape.

> *Amanzi* — water (isiXhosa / isiZulu).

This is the MVP. PWA built with Next.js, Supabase, and MapLibre. Designed to be installed on a phone, share-able via a WhatsApp link, and work on a low-data connection.

---

## What's in here

```
amanzi-alert/
├── app/                # Next.js App Router pages
│   ├── page.tsx        # Home — the live map
│   ├── report/         # Report-an-outage flow
│   └── about/          # What this is, why it exists
├── components/         # Map, ReportForm, Header, InstallPrompt
├── lib/                # Supabase clients, types, geolocation helper
├── public/             # PWA manifest, service worker, icons
└── supabase/
    └── migrations/     # Database schema (run in Supabase SQL editor)
```

---

## First-time setup

You only do these steps once.

### 1. Install Node.js

You don't have Node installed yet. Get the LTS version:

1. Go to https://nodejs.org/
2. Download the macOS Installer (LTS, currently 22.x)
3. Run the `.pkg` file — accept the defaults
4. Open a **new** Terminal window (important — old ones don't see new PATH)
5. Verify:
   ```bash
   node --version
   npm --version
   ```
   Both should print version numbers.

### 2. Install project dependencies

```bash
cd ~/Desktop/amanzi-alert
npm install
```

This downloads Next.js, Supabase client, MapLibre, etc. into `node_modules/`. Takes ~1–2 minutes.

### 3. Create a Supabase project (free tier)

1. Go to https://supabase.com → Sign up (GitHub login is fastest).
2. New Project → name it `amanzi-alert` → pick the closest region (Europe/UK is closest to SA).
3. Set a database password and save it somewhere safe.
4. Wait ~1 minute for provisioning.

### 4. Apply the database schema

1. In your Supabase project, go to **SQL Editor** → **New query**.
2. Copy the contents of `supabase/migrations/0001_init.sql` from this repo.
3. Paste and click **Run**.
4. Confirm: in **Table Editor** you should see a `reports` table.

### 5. Get your API keys

1. In Supabase: **Project Settings → API**.
2. Copy:
   - **Project URL** → goes into `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → goes into `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 6. Get a free map tiles key

1. Sign up at https://www.maptiler.com/ (free tier = 100k tile loads/month, plenty for MVP).
2. Dashboard → **API Keys** → copy your default key into `NEXT_PUBLIC_MAPTILER_KEY`.

### 7. Save your environment variables

```bash
cp .env.local.example .env.local
```

Then open `.env.local` in any text editor and paste your three keys.

### 8. Run it

```bash
npm run dev
```

Open http://localhost:3000 — you should see the map centered on the Eastern Cape.

### 9. Submit a test report

Click **Report an outage near you** → choose a severity → submit.
- It should appear on the map within ~1 second (via Supabase Realtime).
- Check **Table Editor → reports** in Supabase to see the row.

---

## Deploying to the public internet

Once the app runs locally:

1. Push the code to GitHub (`gh repo create amanzi-alert --private --source=. --push` if you have `gh` CLI; otherwise create a repo on github.com manually).
2. Go to https://vercel.com → Sign up with GitHub.
3. **Import Project** → pick `amanzi-alert`.
4. In the Vercel project settings, add the three env vars from `.env.local`.
5. Deploy.
6. You get a URL like `amanzi-alert.vercel.app`. Buy a real domain (e.g. `amanzialert.co.za` on Domains.co.za) later.

---

## What's NOT in the MVP (yet)

These are intentionally cut to ship faster. Each is a future sprint:

- Photo upload
- Confirm / resolve buttons on existing reports
- Heatmap layer at low zoom
- Push notifications when your area goes out
- Reverse-geocoding to auto-fill suburb + municipality
- Multi-language UI (isiXhosa, Afrikaans, isiZulu)
- Municipality dashboards
- Public open-data API

See [ADMISSIONS.md](./ADMISSIONS.md) for the application strategy and evidence log.

---

## Stack rationale

- **Next.js PWA** (not React Native): No app-store gatekeeping, distributable as a WhatsApp link (the dominant viral channel in SA), works on cheap Android, installable. Migrate to React Native once we have traction.
- **Supabase**: Postgres + PostGIS for proper geospatial queries, anonymous-friendly RLS, Realtime channels for the live map. Free tier covers MVP.
- **MapLibre**: Open-source, no Mapbox token tax, swap tile providers without code changes.
- **Vercel**: Free hobby tier; zero-config Next.js deployments.

All free-tier-friendly. No credit card needed to launch.
