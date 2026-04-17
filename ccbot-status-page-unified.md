# CCBot: Unified Infrastructure Status Page

## Goal
Create a **single public infrastructure status page** for Crontinel at `https://app.crontinel.com/status` (routed from `status.crontinel.com` via Cloudflare).

This is NOT a multi-tenant per-user status page feature. It's ONE page showing all of Crontinel's own infrastructure status — like `status.vercel.com` or `status.railway.app`.

## Current State
- Laravel app at `~/Work/crontinel/app/`
- Public status page already exists at `GET /status/{slug}` but it's for per-user status pages
- A "Crontinel Status" page with 3 endpoints is seeded: app.crontinel.com, Railway internal, crontinel.com
- Design is basic/ugly — needs professional look

## What to Build

### 1. New Route
Create `GET /status` (no slug) as Crontinel's official infrastructure status page.

### 2. Design
Professional status page aesthetic — clean, minimal, trust-building.参考:
- Vercel: `status.vercel.com` — clean grid, green/red dots, incident history
- Railway: `status.railway.app` — minimal, dark-ish, clear status badges
- Atlassian: `status.atlassian.com` — simple table, clear status

Design requirements:
- Dark theme (match Crontinel brand: `bg-slate-950`)
- Overall status banner at top (ALL SYSTEMS OPERATIONAL / DEGRADED / INCIDENT)
- Services listed as rows: name, status badge, last checked time
- Services to monitor (hardcoded for now):
  - App (app.crontinel.com) — 1min interval
  - API (api.crontinel.com or same as app)
  - Landing (crontinel.com) — 5min interval
  - Database (Neon PostgreSQL) — 1min interval
  - Email (Resend) — 5min interval
- Response time per service
- Recent incident banner (if any open incidents)
- 7-day incident history section
- Footer: "Last updated X seconds ago" + "Powered by Crontinel" link

### 3. Data Source
Query the existing `status_page_endpoints` table for the "Crontinel Status" page (team_id=2), plus add a `service_type` column to categorize endpoints.

Or: create a simple `infrastructure_services` table with hardcoded services + their check logic.

**Recommended:** Use the existing status page infrastructure but:
- Add `service_type` column: 'app' | 'api' | 'landing' | 'database' | 'email'
- Change the `/status` route to show the "Crontinel Status" page (team_id=2) but with better design
- The slug-based `/status/{slug}` route stays for per-user status pages

### 4. Status Logic
- **All Operational**: all endpoints UP → green banner
- **Degraded**: any endpoint slow (>2000ms) but not down → yellow banner
- **Partial Outage**: some endpoints DOWN → red banner
- **Major Outage**: all endpoints DOWN → red banner + incident auto-created

### 5. File to Update/Create
- `app/Http/Controllers/StatusPageController.php` — add `publicStatus()` method for `/status`
- `resources/views/status-pages/public.blade.php` — NEW clean design (NOT extending layouts/app)
- `routes/web.php` — add `Route::get('/status', ...)` before the slug-based route
- `database/migrations/..._add_service_type_to_status_page_endpoints.php` — add service_type enum

### 6. Cloudflare Routing (manual step)
After deployment, Harun will update Cloudflare:
- `status.crontinel.com` CNAME → `app.crontinel.com` (proxy mode)
- Or: Page Rule to forward `status.crontinel.com/*` → `app.crontinel.com/status`

## Constraints
- Single file blade view (no React/Vue)
- Dark theme: `bg-slate-950`, text `white/slate-400`
- No `@vite` — no compiled assets available in prod
- Mobile responsive
- No auth required (public page)
- IF STUCK, ASK before trying alternatives
