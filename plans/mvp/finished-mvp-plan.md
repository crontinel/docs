# Crontinel — Finished MVP Plan (Cloud Cron Tunnel)

> **Version:** 1.0
> **Status:** Planning — ready for review and implementation
> **Concept:** Crontinel as a **cron-tunnel** — a cloud service that both monitors *and* triggers cron jobs.

---

## 1. Core Concept

Crontinel is a **two-way cron tunnel**:

| Direction | What it does | Status |
|---|---|---|
| **Monitor** (package → cloud) | SDKs on user servers report cron runs, queue depth, worker status to app.crontinel.com | ✅ Built |
| **Trigger** (cloud → package) | Cloud schedules and triggers cron job execution on user servers through a persistent agent | ⬜ Needs MVP |

The MVP must ship both directions to deliver on the "cloud cron" promise.

---

## 2. What's Already Built & Deployed

The following is live on `app.crontinel.com` and `crontinel.com`:

### Cloud side (app.crontinel.com)
| Area | Details | Status |
|---|---|---|
| Auth | Google OAuth, GitHub OAuth, email/password, 2FA ready | ✅ |
| Teams/Orgs | Multi-tenancy, team creation, member invites, owner/member/viewer roles | ✅ |
| Dashboard | Org overview with app count, recent activity, onboarding guidance | ✅ |
| Apps | Create/manage apps, generate API keys, per-app settings | ✅ |
| Alert Channels | Email, webhook, Slack, PagerDuty — CRUD + dispatch | ✅ |
| Alert Rules | Failure detection, cooldowns, per-channel routing | ✅ |
| Cron History | Run history with status, duration, exit code, full log viewer | ✅ |
| Retries | Retry-eligible failures, configurable retry policy | ✅ |
| Billing | Free ($0) and Team ($49/mo) plans, Stripe/Cashier, self-host option | ✅ |
| Status Page | status.crontinel.com — live with 5 infrastructure endpoints | ✅ |
| Health | /up → `{"ok":true}`, /db-ok, /dns-ok | ✅ |

### Landing page (crontinel.com)
| Area | Details | Status |
|---|---|---|
| Marketing | Hero, features, how-it-works, pricing, docs links | ✅ |
| Pricing | Free, Team ($49/mo), self-host, lifetime deal | ✅ |
| Docs | Feature docs, quickstart, GitHub links | ✅ |

### Package SDKs
| Package | Location | Status |
|---|---|---|
| Laravel | `laravel/` | ✅ Built, needs publish |
| Node.js | `node/` — `@crontinel/node` | ✅ Published to GitHub Packages |
| Go | `go/` — `github.com/crontinel/go` | ✅ Built |
| Rust | `rust/` | ✅ Built |
| .NET | `dotnet-sdk/` | ✅ Built |

### Testing
| Area | Details | Status |
|---|---|---|
| Feature tests | 309+ tests passing (sqlite) | ✅ |
| CI | GitHub Actions, Postgres CI | ✅ |
| Live smoke checks | Health, login, ingest auth verified | ✅ |

---

## 3. What's Needed for MVP Release

### Phase A: Cloud Cron Trigger (the "Tunnel")

The critical missing piece: **cloud-initiated cron execution**.

| # | Task | Description | Depends On |
|---|---|---|---|
| A1 | **Agent protocol** | Define the tunnel protocol — WebSocket or long-poll connection from user's server to Crontinel cloud | — |
| A2 | **Agent daemon** | Build the persistent agent that users run on their server (starts as a simple process, maintains connection, receives trigger commands, executes them, reports results) | A1 |
| A3 | **Cloud trigger API** | API endpoint or scheduler action that sends "run command X" through the tunnel to a connected agent | A1 |
| A4 | **Trigger UI** | Dashboard UI to view/manage triggers (schedule one-time or recurring, see trigger history) | A3, Dashboard |
| A5 | **Package agent integration** | Embed agent capability into the Laravel, Node, Python packages so they can receive triggers | A2, Packages |

### Phase B: Package Release & Polish

| # | Task | Description | Depends On |
|---|---|---|---|
| B1 | **Publish npm package** | Publish `@crontinel/node` to public npm (not just GitHub Packages) | — |
| B2 | **Publish Laravel package** | Publish `crontinel/laravel` to Packagist | — |
| B3 | **Publish Go module** | Tag `go` module for public use | — |
| B4 | **Quickstart guides** | Write copy-paste quickstarts for each package on the landing page | B1-B3 |
| B5 | **Install flow polish** | Verify the dashboard → API key → copy command → done flow is seamless | B1-B3 |

### Phase C: Launch Readiness

| # | Task | Description | Depends On |
|---|---|---|---|
| C1 | **Waitlist/registration** | Free tier signup → immediate access flow verified | — |
| C2 | **Docs site** | Documentation site or docs.crontinel.com with setup guides, API reference | B4 |
| C3 | **Onboarding email** | Post-signup email sequence (welcome, first app, first alert) | — |
| C4 | **SEO/content** | Landing page SEO, blog posts (the comparison content + use cases) | — |
| C5 | **Error monitoring** | Production error tracking (Sentry/Bugsnag) on the app | — |
| C6 | **Performance** | Verify app handles load — rate limiting, queue backpressure, caching | — |

---

## 4. Release Criteria

The MVP is ready to launch when:

- [ ] **Cloud cron trigger works end-to-end**: Schedule a cron job from the dashboard → agent receives it → executes → result shows in history → alert fires on failure
- [ ] **At least one package (Laravel or Node) publishes to public registry**: Users can `composer require` or `npm install` without GitHub auth
- [ ] **Quickstart flow verified**: New user signs up → creates app → gets API key → copies install command → sees first run in dashboard
- [ ] **No critical bugs**: All tests pass, no 500 errors on core flows (auth, dashboard, alerts, billing)
- [ ] **Status page operational**: status.crontinel.com shows real infrastructure status

---

## 5. Out of Scope for MVP

| Item | Rationale |
|---|---|
| Mobile app | Web-first; mobile can follow |
| SMS/PagerDuty alerts beyond MVP | Email + webhook covers the core need |
| Advanced dashboard analytics | Uptime percentages, charts — post-MVP |
| Self-hosted agent auto-update | Manual agent update is fine for launch |
| Multi-region/HA tunnel | Single-region cloud for MVP |
| Full API documentation site | Quickstart + inline docs suffice for launch |

---

## 6. Suggested Implementation Order

```
Week 1: A1 (agent protocol) + A2 (agent daemon prototype)
Week 2: A3 (cloud trigger API) + A5 (Laravel agent integration)
Week 3: B1–B4 (package publishing + quickstarts)
Week 4: C1–C6 (launch readiness + verification)
```

---

## 7. Risk Points

- **Agent protocol design** — WebSocket vs long-poll vs SSE. WebSocket is more complex but gives real-time triggers. Long-poll is simpler but slower. Recommend: SSE for receiving triggers, HTTP POST for reporting results.
- **Package publishing** — npm, Packagist, and Go module publishing each have their own auth/CI setup. Each needs a one-time configuration.
- **Agent daemon persistence** — Users need to keep the agent running (systemd, supervisor, or Docker). The agent must auto-reconnect on network drops.
