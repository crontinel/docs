# Unified Status Page — MERGED Plan (ct + CCBot)

## Decision: Laravel Polls Everything

**tl;dr: Kill Gatus Railway service. Use Laravel's `CheckStatusPages` command for ALL polling. One system, one cost, no duplication.**

**Why not Gatus sidecar:** Config is static (can't dynamically add customer endpoints), two failure modes, over-engineered for our needs. CCBot's polling code is already built and works.

---

## Architecture

```
Customer adds endpoint via Dashboard
         │
         ▼
┌─────────────────────────┐
│  Supabase PostgreSQL     │
│  status_pages +          │
│  status_page_endpoints   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Railway: Laravel App                       │
│                                             │
│  ┌─────────────────────────┐               │
│  │ schedule:run (supervisord)│ ◄── cron * * │
│  │  └─ CheckStatusPages     │               │
│  │       └─ polls all       │               │
│  │          endpoints       │               │
│  └─────────────────────────┘               │
│                                             │
│  Public Page: /status/{slug}                │
│  └─ reads from DB, renders clean page       │
└─────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 0 — Supabase Connectivity (HIGHEST PRIORITY)
Try in order:
1. `DB_PORT=6543` (connection pooler) — change in Railway env vars, redeploy, test
2. If that fails: check if Supabase dashboard has IP allowlist for Railway's egress

### Phase 1 — Add Supervisord to Dockerfile
**Why:** `schedule:run` needs a long-running process. `supervisord` keeps it alive alongside PHP-FPM.

Files:
- `app/Dockerfile` — add `apk add supervisor`
- `app/supervisord.conf` — new file (see below)
- `app/bootstrap/app.php` or `app/Console/Kernel.php` — schedule `status-pages:check` every minute

### Phase 2 — Kill Gatus Railway Service
After Phase 3+4 are live:
1. Railway dashboard → Gatus service → Delete
2. Cloudflare DNS: `status.crontinel.com` CNAME → `crontinel-production.up.railway.app`

### Phase 3 — Wire Up CheckStatusPages + Seeder
- `app/database/seeders/CrontinelStatusPageSeeder.php` — seed Crontinel's own infra:
  - `app.crontinel.com/up` (interval 30s)
  - `crontinel-production.up.railway.app/up` (interval 30s)
- Schedule: `php artisan status-pages:check` every minute in `Kernel.php`

### Phase 4 — Build Public Status Page
- `Route::get('/status/{slug}')` in `web.php`
- `StatusPageController::show()` — reads from DB, renders blade view
- `resources/views/status-pages/show.blade.php` — clean dark-theme page
  - Overall status badge (All Systems Operational / Partial Outage / Major Outage)
  - Endpoint grid: name, URL, status indicator, uptime %, avg response time
  - Recent incidents (last 7 days)

### Phase 5 — Incident Tracking
Add migration + model:
- `status_page_incidents` table: `endpoint_id`, `started_at`, `resolved_at`, `duration_seconds`
- When `last_status` changes from `up` to `down` → create incident
- When `last_status` changes from `down` to `up` → close incident
- Display on public page as timeline

### Phase 6 — Gatus Config Cleanup
- Keep `status/config.yaml` as LOCAL DEVELOPMENT reference only
- Archive `status/` repo or mark it deprecated

---

## Files to Create/Modify

### New Files
- `app/supervisord.conf`
- `app/database/seeders/CrontinelStatusPageSeeder.php`
- `app/app/Http/Controllers/StatusPageController.php` (extend)
- `app/resources/views/status-pages/show.blade.php`
- `app/database/migrations/xxxx_create_status_page_incidents_table.php`
- `app/app/Models/StatusPageIncident.php`

### Modified Files
- `app/Dockerfile` — add `supervisor`, remove Gatus (eventually)
- `app/app/Console/Kernel.php` — add `status-pages:check` schedule
- `app/routes/web.php` — add `/status/{slug}` route
- `app/app/Providers/AppServiceProvider.php` — if needed for binding

### Delete (after migration)
- `status/` repo (or archive)
- Gatus Railway service

---

## Key Differences from CCBot's Original Plan
- ❌ No Gatus sidecar binary in container
- ❌ No dynamic Gatus config generation
- ❌ No Gatus webhook endpoint
- ✅ Laravel scheduler + `CheckStatusPages` does ALL polling
- ✅ `supervisord` keeps `schedule:run` alive
- ✅ One system: store + poll + render

---

## Risks
| Risk | Mitigation |
|------|-----------|
| `schedule:run` dies | supervisord auto-restarts |
| Railway kills long-running processes | Monitor, set `restart` in supervisord |
| Endpoint not reachable (private URL) | Document: must be publicly accessible |
| Supabase still unreachable | Fall back to `DB_CONNECTION=sqlite` for session only, polling via external cron |

---

## Done = ✅
When all phases complete:
- `status.crontinel.com` → Laravel public status page
- Customer-added endpoints → polled every N seconds via Laravel scheduler
- Incidents tracked with start/end timestamps
- Gatus Railway service gone → ~$2-3/mo savings
- One unified system for everything
