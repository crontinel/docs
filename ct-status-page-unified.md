# ct: Unified Status Page Plan — 2026-04-16

## What We Have Today

| Component | Where | What it does |
|-----------|-------|-------------|
| Gatus (separate Railway) | `status/` repo | Polls 2 infra endpoints, serves status UI |
| `CheckStatusPages` command | Laravel | Polls customer endpoints, stores in DB |
| `StatusPageController::show()` | Laravel | Renders public status page (not built yet) |
| Supabase | External | Stores customer endpoint configs + results |

**The problem:** Both Gatus AND Laravel poll HTTP endpoints. Duplication. Also paying for a separate Railway service.

---

## The Key Architectural Question

**Gatus vs Laravel polling — who owns the HTTP checks?**

### Option A — Laravel Polls Everything (Recommended)
- Kill Gatus entirely. Laravel `CheckStatusPages` command polls ALL endpoints.
- Gatus `config.yaml` stays as a static file for local development only.
- Railway runs `php artisan schedule:run` every minute via cron.
- Pros: One system to maintain, no duplication, no extra container cost.
- Cons: Need `schedule:run` running on Railway (it's a long-running process, not a cron daemon).

### Option B — Gatus Sidecar + Laravel Stores
- Keep Gatus binary as sidecar inside Laravel container.
- Gatus does HTTP checks every 30s.
- Gatus POSTs results to `/api/gatus/results`.
- Laravel stores in DB, renders status page.
- Pros: Gatus is battle-tested for health monitoring.
- Cons: Config is static — can't dynamically add customer endpoints without regenerating config + restarting Gatus. Two systems = two failure modes.

### Option C — Hybrid (Compromise)
- Gatus polls ONLY Crontinel's own infra (app.crontinel.com, Railway URL).
- Laravel polls all customer-added endpoints.
- Separate Gatus service becomes cheap (~0.5GB RAM Alpine container).
- Pros: Each tool used for what it's best at.
- Cons: Still two systems.

---

## Recommended: Option A — Laravel Polls Everything

### Why?
1. **CCBot's code already does it** — `CheckStatusPages` command is built and ready
2. **No config drift** — endpoints added in DB immediately start being polled
3. **One system** — results stored + page rendered in same Laravel app
4. **No sidecar complexity** — no supervisord, no Gatus binary, no config generation
5. **Scheduler is already set up** — Laravel's scheduler can run every minute

### The catch: `schedule:run` on Railway
Laravel's scheduler needs a long-running process, not just cron. On Railway, the standard pattern is:

**Option 1 — `schedule:run` as a separate process:**
```dockerfile
# In Dockerfile, run both:
CMD ["/usr/bin/supervisord", "-c", "/app/supervisord.conf"]
```
With supervisord running both `php-fpm` AND `php artisan schedule:run`.

**Option 2 — Cron on Railway:**
Railway lets you add a cron job that runs `php artisan schedule:run` every minute.
But this means scheduler runs once per minute, not continuously. For status checks with 30s intervals, we'd miss checks.

**Option 3 — Use an external scheduler:**
Use a free external cron service (cron-job.org, EasyCron) to hit `https://app.crontinel.com/api/scheduler/run` every minute.
This endpoint would fire Laravel's scheduler synchronously.

**Best approach for Railway:** Option 1 with supervisord. Run `schedule:run` as a foreground process under supervisord alongside PHP-FPM.

### Implementation Plan

#### Phase 1 — Kill Gatus, Consolidate to Laravel (Priority)
```
1. Kill separate Gatus Railway service
2. Delete `status/` repo (or archive — Gatus config is static reference)
3. Add to Railway cron: `* * * * * php artisan schedule:run`
4. Laravel now polls both infra AND customer endpoints
5. status.crontinel.com DNS → repoint to main app
```

**How Laravel scheduler works:**
- `app/Console/Kernel.php` — schedule `CheckStatusPages` to run every minute
- For 30s checks: schedule two runs, or use `--endpoint` flag with two cron entries
- Actually: schedule `status-pages:check` every minute. Within the command, it checks `isDueForCheck()` per endpoint. If interval is 30s and it ran 60s ago, it fires.

#### Phase 2 — Fix Supabase Connectivity
Once Laravel polls everything, results are stored in Supabase. Must have connectivity.

#### Phase 3 — Build Public Status Page
- `Route::get('/status/{slug}')` — `StatusPageController::show()`
- Reads status page + endpoints from DB
- Shows uptime %, current status, recent incidents
- Clean dark-theme branded view

#### Phase 4 — Incident History
- `status_page_incidents` table (migrations don't exist yet — add)
- When endpoint goes `down` → create incident record with `started_at`
- When it goes back `up` → set `resolved_at`
- Display incident timeline on public page

---

## What CCBot Should Build

Based on my independent analysis, CCBot's existing `CheckStatusPages` command + models are the RIGHT foundation. The unified plan should:

1. **Keep** `CheckStatusPages.php` — already polls correctly
2. **Keep** `StatusPage` + `StatusPageEndpoint` models — good schema
3. **Extend** `StatusPageController` with `show()` for public pages
4. **Add** `StatusPageIncident` model + migration for downtime tracking
5. **Add** seeder for Crontinel's own infra endpoints
6. **Add** `supervisord` so `schedule:run` stays alive on Railway
7. **Kill** Gatus Railway service
8. **Add** cron schedule for `status-pages:check`

## Why NOT Option B (Gatus Sidecar)

1. **Config is static** — Gatus config.yaml is a static file. Customer endpoints are dynamic. Would need to regenerate config + restart Gatus on every endpoint add/remove. Complex.
2. **Two systems** — Gatus sidecar + Laravel = two things that can break.
3. **Over-engineering** — We don't need Gatus's multi-region checks or advanced alerting. Laravel's simple polling is sufficient.
4. **Cost saving is marginal** — Gatus container is ~$2-3/month on Railway's cheapest plan. Not worth the complexity.
5. **Duplication** — Gatus and `CheckStatusPages` would both be polling. Wasteful.

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| `schedule:run` process dies | supervisord auto-restarts |
| Railway cron not reliable | Use external cron-job.org as backup |
| Customer endpoint not reachable from Railway | Document: endpoints must be publicly accessible |
| 30s interval too slow for critical alerts | Add `alert_after` config (e.g., 3 consecutive failures = alert) |

## Summary

**Kill Gatus. Use Laravel.** CCBot's `CheckStatusPages` already does the right thing. We just need:
1. Supabase connectivity (Step 1)
2. `supervisord` to keep `schedule:run` alive
3. Public status page renderer
4. Kill Gatus Railway service + repoint DNS

This is cleaner, cheaper, and one less system to maintain.
