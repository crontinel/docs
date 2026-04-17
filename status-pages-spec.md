# Status Pages — Implementation Spec

## Overview

Public status pages let Crontinel users show their stakeholders the uptime health of their apps/websites. Each user (team) can create one or more status pages, each with multiple endpoints that are periodically checked. The results are displayed on a public, shareable URL — no login required to view.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Laravel App (Railway)                              │
│                                                     │
│  ┌──────────────┐  ┌────────────────────────────┐ │
│  │ StatusPage   │  │ StatusPageEndpoint         │ │
│  │ Controller   │──│ Controller                 │ │
│  └──────┬───────┘  └──────────┬─────────────────┘ │
│         │                     │                     │
│  ┌──────▼─────────────────────▼─────────────────┐ │
│  │  HealthController (public JSON API)          │ │
│  │  GET /status/{slug}  →  {endpoints, overall}  │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │  CheckStatusPages (Laravel Artisan Command)  │ │
│  │  Runs via scheduler every N minutes          │ │
│  │  HTTP HEAD/GET → store result in DB          │ │
│  └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │  Public Status Page │
              │  /status/{slug}      │
              │  (Blade view)        │
              └─────────────────────┘
```

## Database Schema

### Migration 1: `status_pages`

| Column | Type | Notes |
|--------|------|-------|
| id | bigint unsigned | PK |
| team_id | bigint unsigned | FK → teams.id |
| name | varchar(255) | Display name |
| slug | varchar(255) | Unique, URL-safe, used in public URL |
| description | text | nullable |
| is_public | boolean | Default true |
| branding_settings | json | nullable — logo, accent color, custom message |
| created_at | timestamp | |
| updated_at | timestamp | |

**Index:** unique on `(team_id, slug)`

### Migration 2: `status_page_endpoints`

| Column | Type | Notes |
|--------|------|-------|
| id | bigint unsigned | PK |
| status_page_id | bigint unsigned | FK → status_pages.id |
| name | varchar(255) | Human-readable label (e.g. "API", "Homepage") |
| url | varchar(2048) | URL to check |
| interval | integer | Check interval in minutes (default 5) |
| conditions | json | nullable — expected status codes, response body patterns |
| last_check_at | timestamp | nullable |
| last_status | enum('up','down','unknown') | Default 'unknown' |
| last_response_time_ms | integer | nullable |
| last_error | varchar(255) | nullable |
| created_at | timestamp | |
| updated_at | timestamp | |

**Index:** on `status_page_id`

## Gatus Integration — Chosen Approach: Option C

**Approach C — Laravel Scheduler + DB storage.**

Rationale:
- **Gatus is already in production** for Crontinel's own infrastructure monitoring. Reusing it for customer status pages would require significant engineering (dynamic config generation, hot-reload, multi-tenant isolation, secrets management).
- **Option C is simpler to build and reason about.** The scheduler runs `CheckStatusPages` command every minute. Each endpoint's interval field controls how often it should actually fire (e.g., every 5 min). Check results go straight to the DB — no intermediate system needed.
- **Scalable enough for launch.** Check frequency is bounded by how often the scheduler runs. For Free tier (1hr interval), a single scheduler entry per page is fine. For Pro, we can run the command more frequently.
- **Future migration path.** If Gatus integration becomes a priority, we can build a separate Gatus config generator service later without changing the DB schema or controller surface.

**Monitoring flow:**
1. `CheckStatusPages` command fetches all endpoints where `last_check_at IS NULL OR last_check_at < now() - interval_minutes`
2. Fires HTTP GET (or HEAD) to each endpoint URL
3. Evaluates `conditions` JSON: expected status codes, optional body substring check
4. Writes `last_check_at`, `last_status`, `last_response_time_ms`, `last_error` to DB
5. If status changed (up→down or down→up), fires a Crontinel alert (reuse existing AlertChannel system) — stretch goal

## API Design

### Web Routes

All routes live in `routes/web.php`.

| Method | URI | Auth | Description |
|--------|-----|------|-------------|
| GET | `/status-pages` | team required | List all status pages for team |
| GET | `/status-pages/create` | team required | Create form |
| POST | `/status-pages` | team required | Create a new status page |
| GET | `/status-pages/{status_page}/edit` | team required | Edit form |
| PATCH | `/status-pages/{status_page}` | team required | Update status page |
| DELETE | `/status-pages/{status_page}` | team required | Delete status page |
| POST | `/status-pages/{status_page}/endpoints` | team required | Add endpoint to page |
| DELETE | `/status-pages/{status_page}/endpoints/{endpoint}` | team required | Remove endpoint |
| GET | `/status/{slug}` | public | Public status page view |

### JSON API (public)

**`GET /status/{slug}`**

Response 200:
```json
{
  "status_page": {
    "name": "Acme Corp",
    "description": "Our system status",
    "branding_settings": {}
  },
  "overall_status": "up",
  "endpoints": [
    {
      "id": 1,
      "name": "API",
      "url": "https://api.acme.com/health",
      "last_check_at": "2026-04-15T14:00:00Z",
      "last_status": "up",
      "last_response_time_ms": 120
    }
  ],
  "generated_at": "2026-04-15T14:05:00Z"
}
```

Response 404:
```json
{ "error": "Status page not found or not public" }
```

## Frontend

### Dashboard Pages (`/status-pages/*`)
- Blade views using existing Crontinel layout
- Dark theme (Tailwind `dark:` classes matching existing dashboard)
- List view: table of status pages with slug, endpoint count, public/private badge
- Create/Edit: form with name, slug (auto-generated, editable), description, public toggle, branding JSON textarea
- Endpoint management: table with add/remove, fields: name, URL, interval (minutes), conditions (JSON)

### Public Status Page (`/status/{slug}`)
- Clean, public-facing page (no auth, no nav chrome)
- Dark theme with Crontinel branding
- Overall status badge: **All Systems Operational** (green) / **Partial Outage** (yellow) / **Major Outage** (red)
- Endpoint list: name, URL, status indicator (🟢 UP / 🔴 DOWN), last checked timestamp, response time
- Branding: accent color from `branding_settings`, optional logo URL, custom footer message
- Mobile responsive

## User Flow

1. User logs in → Dashboard
2. Clicks **"Status Pages"** in sidebar nav
3. Clicks **"Create New Status Page"**
4. Enters name, optional description, toggles public/private, sets branding (accent color)
5. URL slug auto-generated from name (editable, unique per team)
6. **"Add Endpoints"** — enter name, URL, check interval (Free: 60min, Pro: custom)
7. Saves → gets shareable URL: `https://crontinel.com/status/acme`
8. Endpoint checks begin immediately on next scheduler run

## Pricing

| Feature | Free | Pro |
|---------|------|-----|
| Status pages | 1 | Unlimited |
| Endpoints per page | 5 | Unlimited |
| Check interval | 60 min | 5 min |
| Custom branding | ❌ | ✅ |
| Custom domain | ❌ | ✅ |
| Incident history | ❌ | ✅ (stretch) |

Enforcement: `PlanLimits::canCreateStatusPage($team)` checks limits. Endpoint interval enforced in `store` validation.

## Implementation Notes

- **Slug uniqueness**: scoped per team (`team_id` + `slug` unique index). On conflict, append random suffix.
- **Authorization**: `abort_if($page->team_id !== auth()->user()->current_team_id, 403)` pattern consistent with existing controllers.
- **Plan limits**: Use existing `PlanLimits` service. Add new methods `canCreateStatusPage`, `canAddEndpoint`, `canUseCustomBranding`.
- **Gatus**: Not used for status page monitoring at this stage. Revisit if customer scale demands it.
- **SoftDeletes**: Add `SoftDeletes` to `StatusPage` model for safety.
- **Conditions JSON schema**: `{"expected_status":[200,201],"contains":"\"status\":\"ok\"","timeout_ms":5000}`
- **Last_check_at null**: Treat as "never checked" → status = "unknown"
- **HTTPS-only URLs**: Validate URL starts with `https://` (allow http for internal/dev URLs)
- **Rate limiting on public endpoint**: Consider caching with `Cache::remember` for 30s to prevent abuse

## File Map

```
app/
  app/Models/
    StatusPage.php
    StatusPageEndpoint.php
  app/Http/Controllers/
    StatusPageController.php
    StatusPageEndpointController.php
    StatusPageHealthController.php   ← public JSON endpoint
  app/Console/Commands/
    CheckStatusPages.php            ← scheduler command
  app/Services/
    PlanLimits.php                  ← extend existing
  database/migrations/
    2026_04_15_000000_create_status_pages_table.php
    2026_04_15_000001_create_status_page_endpoints_table.php
  resources/views/
    status-pages/
      index.blade.php
      create.blade.php
      edit.blade.php
      _form.blade.php
      endpoints.blade.php
    status/
      show.blade.php                 ← public page
  routes/
    web.php                          ← add status page routes

app-status-pages/                   ← workspace root, reference only
  SPEC.md                            ← (this file)
  (code is in app/ above)
```

## Gatus Integration (Detailed)

### Why NOT Option A (dynamic Gatus config)

Gatus config is YAML-based and hot-reloaded via its REST API. Per-customer configs would require:
1. A Gatus config file per customer (or per-status-page), stored in object storage or mounted volumes
2. A config reload API call to Gatus every time a customer adds/updates/removes an endpoint
3. Secret management: Gatus supports `environment variables` in config, but per-endpoint credentials would need unique env var names per customer
4. Isolation: Gatus runs as a single Railway service. All customer endpoint traffic originates from Crontinel's Railway IP. This is fine for public endpoints, but complicates private/VPC endpoints
5. Complexity: building a YAML config generator + reload pipeline is significant work

### Why NOT Option B (extend `/up`)

The existing `/up` endpoint returns a static health response for Railway's load balancer health check. Extending it to serve per-customer status page data would require:
1. Authentication mechanism for customers to identify themselves (API keys)
2. URL scheme like `/up/{api_key}/{status_page_id}`
3. Rate limiting per customer
4. More complex routing

Option C is cleaner for v1.

### Option C Implementation Detail

```php
// app/Console/Kernel.php
$schedule->command('status-pages:check')->everyMinute();

// CheckStatusPages.php
// 1. Fetch all endpoints due for a check
// 2. Batch HTTP requests (Guzzle concurrency)
// 3. Write results to DB
// 4. Dispatch AlertJob if status changed (stretch)
```
