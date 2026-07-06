# Faith Haven House — Website (Next.js)

Rebuild of faithhavenhouse.org. React + Next.js (App Router), deploys to Vercel.

## Run locally (port 3006)

```bash
cd fhh-website
npm install
npm run dev
```

Open http://localhost:3006 — the port is pinned in package.json so it won't collide with other local servers.

## Deploy to Vercel

1. Push this folder to a GitHub repo (node_modules is gitignored)
2. vercel.com → Add New Project → import the repo → deploy (zero config needed)
3. Point faithhavenhouse.org DNS at Vercel when ready to launch

## Structure

- `app/page.jsx` — homepage assembling all sections
- `app/globals.css` — full design system (tokens in `:root`)
- `app/api/volunteer/route.js` — volunteer form endpoint (TODO: wire to email/Resend in Week 2)
- `components/` — one component per section (Hero, Pyramid, Volunteer, Stories, etc.)
- `public/assets/` — logo suite + value icons

## Notes

- Hero video still streams from Wix CDN — replace with self-hosted file before Wix account closes
- Donations link to Zeffy (external)
- Pre-screen engine ("Get Help" page) is Week 3 scope
