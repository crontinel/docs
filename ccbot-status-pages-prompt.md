# CCBot Prompt: Design Status Pages Feature for Crontinel

## Context
Crontinel is a Laravel SaaS that monitors cron jobs, background jobs, and scheduler health.
Now we want to offer **public status pages** as a feature — so users can show their stakeholders their app/website uptime.

## What Exists
- Laravel app at `~/Work/crontinel/app/` (GitHub: `crontinel/app`)
- Supabase PostgreSQL: **DO NOT USE** — free tier blocks external connections. See `docs/ccbot-supabase-configs.md` for details.
- Database: **BROKEN** — need to switch to Neon or Railway Postgres. See `docs/ccbot-supabase-configs.md`
- Gatus running at `gatus-production-028e.up.railway.app` for our own monitoring (to be deprecated)
- Railway deployment with PHP 8.4 + Laravel 12
- Landing page at `~/Work/crontinel/landing/`

## Database Configs
**NEVER hardcode credentials. Refer to:**
- Password: `~/Work/crontinel/.secrets/supabase.env` → `SUPABASE_DB_PASSWORD`
- All Supabase configs: `docs/ccbot-supabase-configs.md`
- For NEW database: use Neon (free tier) or Railway Postgres

## What You Should Write
Write a **full implementation spec** and **starter code** for the status pages feature.

Save your spec as: `docs/status-pages-spec.md`
Save starter code files under: `app-status-pages/` (new directory in the workspace root)

## Requirements

### 1. Database Schema (write migration)
- `status_pages` table: id, user_id, name, slug, description, is_public, branding_settings (JSON), created_at, updated_at
- `status_page_endpoints` table: id, status_page_id, name, url, interval, conditions (JSON), last_check_at, last_status, created_at, updated_at
- Relationships: user has many status_pages, status_page has many endpoints

### 2. Laravel Backend
- `StatusPage` model with relationships
- `StatusPageController` with:
  - `index` — list user's status pages
  - `create/store` — create new status page
  - `show` — public view of a status page (no auth needed)
  - `addEndpoint` — add endpoint to status page
  - `destroy` — delete status page
- `HealthController` or reuse existing `/up` endpoint to serve status page data as JSON

### 3. Status Page Frontend
- A public Astro/Laravel blade page at `/status/{slug}` 
- Shows: page name, endpoint list with status (UP/DOWN), overall status badge
- Dark theme matching Crontinel brand
- Last checked timestamp per endpoint
- Incident/history section (stretch)

### 4. Gatus Integration Strategy (choose one approach)
Document which approach you're taking and why:
- **Option A**: Generate Gatus config dynamically per status page, reload Gatus via API
- **Option B**: Use our own `/up` endpoint as the monitoring source (extend it)
- **Option C**: Simple HTTP checks via Laravel scheduler + store results in DB

### 5. User Flow
1. User logs in → Dashboard → "Status Pages" → "Create New"
2.填入name, slug, public/private toggle
3. Add endpoints (URL + name + check interval)
4. Get shareable public URL: `https://crontinel.com/status/{slug}`
5. (Stretch) Custom domain mapping

### 6. Pricing Consideration
- Free: 1 status page, 5 endpoints, 1hr interval
- Pro: unlimited pages, endpoints, custom branding, white-label domains

## Output Format
Write a SPEC.md following this structure:
```
# Status Pages — Implementation Spec

## Overview
...

## Architecture
...

## Database Schema
[full migration SQL/Blueprint]

## API Design
[all endpoints with request/response shapes]

## Frontend
[page designs and component descriptions]

## Gatus Integration
[chosen approach + reasoning]

## Implementation Notes
[gotchas, things to watch out for]

## File Map
[list of files to create + their purpose]
```

## Constraints
- Keep it in the `~/Work/crontinel/` workspace
- Laravel 12 + PHP 8.4 compatible
- Dark theme UI
- Mobile responsive
- Do NOT write the full implementation — just the SPEC + migration + skeleton code
- **IF STUCK, ASK before trying alternatives**
- **Store credentials only in project-scoped files, NOT in global ~/.openclaw/secrets/**
