# Competitor Landscape — Crontinel MVP

## Market Segments

### 1. Cron Monitoring (Heartbeat/Ping — "did my job run?")
Monitors by having your cron job ping a URL. Alerts if the ping is late or missing.

| Competitor | Pricing | Strength | Weakness |
|---|---|---|---|
| **Cronitor** | $2/monitor + $5/user | Established brand, good docs, API | Expensive at scale (~$225/100 monitors) |
| **Healthchecks.io** | Free (20 jobs), $5-80/mo | Open-source, self-hostable, 25+ integrations | Basic UI, no cloud triggers |
| **Dead Man's Snitch** | Free (3 snitches), $49/mo pro | Simple, reliable | Very expensive for output capture |
| **Better Stack** | $21/50 monitors | Modern UI, combined uptime + cron | Per-monitor pricing adds up |
| **CronSafe** (new 2026) | EUR 9/mo unlimited | EU-based, modern dashboard | New, unproven |
| **CronSignal** | $5/mo flat | Cheapest flat-rate, unlimited | New, limited integrations |
| **DeadManCheck** | $29/mo flat | Unlimited monitors | New |
| **Hyperping** | $24/mo flat | Status pages + cron | Generic |
| **CronRadar** | $1/monitor/mo | Simple pricing | Per-monitor, not flat |
| **Oh Dear!** | €13/mo (5 sites) | Strong Laravel + Spatie integration | Expensive per site, Laravel-only focus |

### 2. Cron Scheduling/Execution ("run my job on a schedule")
Actually executes HTTP requests or commands on their servers at specified times.

| Competitor | Pricing | Strength | Weakness |
|---|---|---|---|
| **cron-job.org** | Free (donation) | Free, executes HTTP requests | Limited history (25 logs), delays |
| **Crontap** | Free tier + paid | Cronhub replacement, scheduler + monitor | New |
| **FastCron** | Paid | Fast execution | Generic |

### 3. Cronhub Shutdown — June 30, 2026 (5 days away!)
- Cronhub deleting ALL data June 30
- 5+ competitors already published migration guides
- Keywords: "Cronhub alternative," "migrate from Cronhub"
- **Crontinel has ZERO migration content published**

### 4. Known User Pain Points (from community scans)
- "Exit code 0 is a lie" — jobs report success but fail partially
- "Kubernetes CronJob is the quietest workload with loudest failures" — no built-in alerts
- Cron jobs failing silently for weeks (backup scripts, maintenance tasks)
- Stripe webhooks silently losing revenue (5 distinct failure modes)
- Sidekiq dead queue has no notification (7-year-old GitHub issue)

### What Crontinel Already Built

| Area | Status |
|---|---|
| Package → Cloud monitoring (Laravel, Node, Python, Go, Rust, .NET) | ✅ Built |
| Cloud → Package trigger (agent daemon) | ✅ Built |
| Alert channels (Email, Webhook, Slack, PagerDuty) | ✅ Built |
| Dashboard (org, apps, API keys, run history) | ✅ Built |
| Cloud trigger API (POST /triggers, GET /agents, etc.) | ✅ Built |
| Webhook/test dispatch | ⚠️ Queue needs fix in production |
| Published package (crontinel/laravel v0.4.1) | ✅ Live |

## The Core Question

The original MVP was a **two-way tunnel** — both monitor AND trigger. But:

- **Monitoring direction** = heartbeat ping (standard market, many competitors, well-understood)
- **Trigger direction** = cloud schedules commands on your server (innovative, higher friction, needs agent daemon running)

Which one is the real MVP value? Both? One first then the other?
