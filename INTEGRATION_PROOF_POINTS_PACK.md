# Crontinel — Integration Proof-Points Pack

Last updated: 2026-04-10

---

## How to use this document

This is the authoritative reference for what Crontinel claims are backed by shipped code, which claims need softening, and what supporting bullets to use in landing pages, docs, and outreach. Every claim here has been cross-checked against the OSS package source (`src/`), the config file, and the launch audit (LAUNCH_AUDIT.md).

---

## 1. Strongest Claims (Backed by Shipped Code)

These claims have direct proof in the codebase. Use them confidently in headlines, feature bullets, and comparisons.

### 1.1 Horizon internals — per-supervisor visibility

**The claim:** Crontinel reads Horizon's Redis keys directly and reports per-supervisor status, paused state, and failed jobs per minute.

**Why it's strong:** `HorizonMonitor.php` reads `horizon:masters`, `horizon:supervisors:*`, and `horizon:failed_jobs_per_minute` keys from the Redis horizon connection. This is the same data source the Horizon dashboard uses.

**Supporting bullets:**
- Reads `horizon:supervisors:*` Redis keys — reports actual per-supervisor status, not an aggregated boolean
- Detects paused state (`masterStatus === 'paused'`) separately from stopped (`masterStatus === 'stopped'`) — two distinct failure modes, both alerted
- Failed jobs per minute read from `horizon:failed_jobs_per_minute` with a configurable threshold (`failed_jobs_per_minute_threshold`, default 5)
- Alerts when any individual supervisor goes down, even if the Horizon master still reports "running" at the top level
- Configured via `config/crontinel.php` → `horizon.supervisor_alert_after_seconds` and `horizon.failed_jobs_per_minute_threshold`

---

### 1.2 Cron run tracking — zero code changes required

**The claim:** Every scheduled command is tracked automatically after install. No wrapping, no per-command changes.

**Why it's strong:** `RecordScheduledTaskRun.php` registers listeners on Laravel's built-in `ScheduledTaskFinished` and `ScheduledTaskFailed` events. The `CrontinelServiceProvider` wires these automatically on package boot.

**Supporting bullets:**
- Hooks `ScheduledTaskFinished` → records exit code 0 + runtime in milliseconds
- Hooks `ScheduledTaskFailed` → records exit code 1 + exception message as output
- Records: command name, exit code, duration (ms), ran_at timestamp
- Stores runs in the `crontinel_runs` table, created by `crontinel:install`
- `retain_days` config (default: 30) auto-prunes old runs on every recorded execution
- No monkey-patching, no middleware, no wrapper class needed

---

### 1.3 Late detection

**The claim:** Crontinel detects when a scheduled command misses its expected run window.

**Why it's strong:** `CronMonitor::isLate()` computes the previous due time from the cron expression via `CronExpression::getPreviousRunDate()`, then compares it against the last recorded run. A configurable grace period (`late_alert_after_seconds`, default: 120s) prevents false positives on near-misses.

**Supporting bullets:**
- Uses the actual cron expression from Laravel's scheduler — no separate schedule config needed
- Grace period is configurable per deployment (`crontinel.cron.late_alert_after_seconds`)
- Distinguishes four distinct cron states: `ok`, `late`, `failed`, `never_run`
- Late status appears in the dashboard and triggers an alert if an alert channel is configured

---

### 1.4 Queue depth monitoring — Redis and database drivers

**The claim:** Crontinel monitors queue depth, failed count, and oldest job age for both Redis and database queue drivers.

**Why it's strong:** `QueueMonitor.php` has separate branches for `redis` and `database` drivers with distinct queries for each metric.

**Supporting bullets:**
- Redis depth: counts `queues:{queue}` list length (pending) + `queues:{queue}:delayed` sorted set cardinality
- Database depth: queries the `jobs` table with `WHERE queue = ?`
- Failed count: queries the `failed_jobs` table per queue for both drivers
- Oldest job age (Redis): reads the `pushedAt` field from the raw job payload at the tail of the list
- Oldest job age (database): queries `created_at` of the oldest pending job
- Auto-discovers queues when `watch` list is empty: scans Redis keys or queries distinct queue names from `jobs` table
- SQS and other drivers: returns 0 / null gracefully with no crash

---

### 1.5 Alert deduplication and auto-resolve

**The claim:** Alerts fire once per issue, not once per polling cycle. They auto-resolve with a recovery notification.

**Why it's strong:** `AlertService.php` uses Laravel Cache with a 5-minute TTL (`DEDUP_TTL_SECONDS = 300`) as a dedup guard. The `resolve()` method checks Cache before sending a resolution and deletes the key when the issue clears.

**Supporting bullets:**
- Same alert condition will not re-fire for 5 minutes after the first firing
- Recovery notification includes the original alert title and the ISO8601 timestamp it first fired
- Dedup is per-condition: a Horizon alert and a queue alert for separate queues are tracked independently
- Works across Slack, email, and webhook channels — same dedup logic regardless of channel

---

### 1.6 Slack alerts (code shipped)

**The claim:** Slack alerts via incoming webhook, with severity emoji and auto-resolve messages.

**Why it's strong:** `AlertService::sendSlack()` is implemented and uses `Http::post()` to the configured `CRONTINEL_SLACK_WEBHOOK` URL.

**Supporting bullets:**
- Configured with a single env var: `CRONTINEL_SLACK_WEBHOOK=https://hooks.slack.com/...`
- Alert levels map to emoji: critical = 🔴, warning = ⚠️, resolved = ✅
- Message format: `*title*\nmessage` — compatible with standard Slack incoming webhooks
- Recovery message includes "Originally fired at {ISO8601 timestamp}"
- Caveat: end-to-end delivery has not been smoke-tested in production (blocked on VPS — LAUNCH_AUDIT)

---

### 1.7 Email alerts (code shipped)

**The claim:** Email alerts via Laravel's mail stack, configurable recipient via env.

**Why it's strong:** `AlertService::sendMail()` calls `Mail::to($to)->send(new AlertMail(...))`. `AlertMail.php` exists in `src/Mail/`.

**Supporting bullets:**
- Set `CRONTINEL_ALERT_CHANNEL=mail` and `CRONTINEL_ALERT_EMAIL=ops@yourcompany.com`
- Uses Laravel's standard mail stack — works with any SMTP driver (Resend, Mailgun, SES, etc.)
- Same dedup and auto-resolve logic as the Slack channel
- Caveat: delivery blocked on Resend domain verification for cloud use (LAUNCH_AUDIT)

---

### 1.8 Generic webhook alerts (code shipped)

**The claim:** Fire alerts to any HTTP endpoint with a structured JSON payload and optional custom headers.

**Why it's strong:** `AlertService::sendWebhook()` is fully implemented. It reads `crontinel.alerts.webhook.url` and `crontinel.alerts.webhook.headers` from config.

**Supporting bullets:**
- Payload fields: `title`, `message`, `level`, `resolved` (boolean), `fired_at` (ISO8601), `source: "crontinel"`
- Custom headers via `crontinel.alerts.webhook.headers` — covers bearer tokens, shared secrets, API keys
- 10-second timeout; failures are logged without crashing the app
- `resolved: true` flag in payload allows downstream systems to clear incidents programmatically
- PagerDuty compatibility: route to PagerDuty Events API v2 URL with `Authorization: Token token=...` header until the native PagerDuty channel ships

---

### 1.9 CLI health check with exit codes

**The claim:** `php artisan crontinel:check` exits 0 when healthy, 1 when any alert is active. Supports JSON output for CI.

**Why it's strong:** `CheckCommand.php` exists in `src/Commands/`.

**Supporting bullets:**
- `--format=json` outputs machine-readable status for CI/CD pipelines and monitoring scripts
- `--no-alerts` flag checks status without firing configured alert channels (safe for read-only use)
- Table output is human-readable: shows Horizon, queue, and cron status in one view
- Exit code contract: 0 = all healthy, 1 = any alert active

---

### 1.10 Two-command install, no account required

**The claim:** Full local dashboard running in two commands, no SaaS account needed.

**Why it's strong:** The install command and migration are the only required setup for standalone local use.

**Supporting bullets:**
- `composer require crontinel/laravel` — pulls the package
- `php artisan crontinel:install` — publishes `config/crontinel.php` and runs the `crontinel_runs` migration
- Dashboard available at `/crontinel` immediately (path configurable via `CRONTINEL_PATH`)
- No API key, no SaaS account, no external service required for local monitoring and alerting

---

## 2. Claims That Need Softening

These claims appear on the features page, pricing page, or in other materials but are not yet fully shipped or tested end-to-end. Use qualifying language until the corresponding LAUNCH_AUDIT items are cleared.

### 2.1 PagerDuty — "Full incident lifecycle" (features page)

**Current state:** BLOCKED in LAUNCH_AUDIT. PagerDuty is listed as a named alert channel on the features page ("Full incident lifecycle") and pricing page ("Slack, email, PagerDuty, webhook alerts"), but there is no `sendPagerDuty()` method in `AlertService.php`. The code only dispatches on `'slack'`, `'mail'`, and `'webhook'`. Setting `CRONTINEL_ALERT_CHANNEL=pagerduty` will silently drop all alerts — the `default => null` match arm.

**Action required:**
- Remove "PagerDuty" from the four named alert channels on the features page until native support ships
- Replace with: "Webhook — route alerts to PagerDuty Events API, Opsgenie, or any HTTP endpoint"
- On pricing, change "Slack, email, PagerDuty, webhook alerts" to "Slack, email, and webhook alerts"
- Add a docs note explaining the PagerDuty-via-webhook workaround (Events API v2 URL + Authorization header)

---

### 2.2 Status page — listed as Pro/Team feature (pricing page)

**Current state:** "1 status page per app" (Pro) and "Unlimited status pages" (Team) are listed on pricing. LAUNCH_AUDIT shows the status page feature is BLOCKED on VPS provisioning and Gatus setup.

**Recommended softening:** Mark with "Coming soon" badge or remove from the pricing table until VPS is live and per-app status pages are implemented.

---

### 2.3 REST API access — listed as Pro/Team feature (pricing page)

**Current state:** Listed on pricing. PRD has an API spec. No API routes exist in the OSS package. The SaaS application itself is blocked on VPS provisioning.

**Recommended softening:** Keep in pricing table but add a "Coming to early access" qualifier or "SaaS launch" badge.

---

### 2.4 "14-day Pro trial on every signup" (pricing page headline)

**Current state:** BLOCKED on Stripe Price IDs and VPS being live. The trial logic is aspirational until the SaaS billing stack is wired.

**Recommended softening:** Keep for post-launch. Pre-launch, pricing page CTAs should point to the waitlist, not registration. (Confirmed known in launch audit.)

---

### 2.5 "Custom alert rules" — Team plan (pricing page)

**Current state:** Listed as a Team plan feature. No corresponding logic in `AlertService.php`. PRD-level feature only.

**Recommended softening:** Mark as "Coming soon" or remove from pricing until the feature ships.

---

## 3. Integration Claims with Proof Points

### Slack

| Claim | Proof | Status |
|---|---|---|
| Fires on Horizon, queue, and cron alerts | `AlertService::fire()` → `sendSlack()` called from all three evaluators | Code shipped |
| Severity-coded messages | `match($level)` → 🔴 / ⚠️ / ✅ emoji prefix | Code shipped |
| Auto-resolves when issue clears | `AlertService::resolve()` sends recovery message | Code shipped |
| Deduplication (5-min cooldown) | `Cache::has($cacheKey)` guard in `fire()` | Code shipped |
| Config | `CRONTINEL_ALERT_CHANNEL=slack`, `CRONTINEL_SLACK_WEBHOOK=https://hooks.slack.com/...` | — |
| End-to-end delivery | Not yet smoke-tested | Blocked on live VPS |

### Email

| Claim | Proof | Status |
|---|---|---|
| Fires on any alert | `AlertService::sendMail()` via `Mail::to()->send()` | Code shipped |
| Uses Laravel mail stack | `AlertMail` Mailable — compatible with any Laravel mail driver | Code shipped |
| Auto-resolves | Same `resolve()` logic as Slack | Code shipped |
| Config | `CRONTINEL_ALERT_CHANNEL=mail`, `CRONTINEL_ALERT_EMAIL=ops@...` | — |
| End-to-end delivery | Not yet smoke-tested | Blocked on Resend domain verification |

### Webhook

| Claim | Proof | Status |
|---|---|---|
| Structured JSON payload | `sendWebhook()` posts `title`, `message`, `level`, `resolved`, `fired_at`, `source` | Code shipped |
| Custom headers | `config('crontinel.alerts.webhook.headers', [])` applied via `Http::withHeaders()` | Code shipped |
| Resolved flag in payload | `resolved: true` on recovery | Code shipped |
| 10-second timeout | `->timeout(10)` on HTTP client | Code shipped |
| PagerDuty compatibility | Route to PagerDuty Events API v2 URL with `Authorization: Token token=...` header | Available now via webhook |
| End-to-end delivery | Not yet smoke-tested | Blocked on live VPS |

### PagerDuty (native channel)

| Claim | Proof | Status |
|---|---|---|
| Listed as named channel on features page | Landing copy | NOT SHIPPED — no `sendPagerDuty()` in `AlertService.php` |
| Listed on pricing page (Pro) | Pricing table | NOT SHIPPED |
| Silent failure risk | `default => null` in match drops the alert silently | Active risk — fix copy now |
| Workaround available | Webhook channel + PagerDuty Events API v2 | Available today |

---

## 4. Differentiation Claims vs. Competitors

### vs. Healthchecks.io

| Crontinel claim | Proof | Verdict |
|---|---|---|
| No curl calls at the end of scripts | Hooks `ScheduledTaskFinished` automatically — no script modification | Strong — ship it |
| Sees queue depth and Horizon state, not just whether a ping arrived | `HorizonMonitor.php`, `QueueMonitor.php` | Strong — ship it |
| Unlimited monitors at $19/mo | Pricing page: Pro = unlimited monitors | Strong — verify post-launch |
| Laravel-native, understands artisan and Horizon | Package reads Horizon Redis keys, scheduler events natively | Strong — ship it |

### vs. Cronitor

| Crontinel claim | Proof | Verdict |
|---|---|---|
| Composer package with auto-discovery vs. manual HTTP ping setup | `crontinel:install` + automatic event listener registration | Strong — ship it |
| Horizon-aware, not just heartbeat-aware | `HorizonMonitor.php` reads Redis supervisor keys | Strong — ship it |
| Unlimited monitors on every paid plan | Pricing page — no per-monitor pricing | Strong — verify post-launch |
| Per-supervisor visibility | `getSupervisors()` reads `horizon:supervisors:*` keys individually | Strong — ship it |

### vs. Better Stack

| Crontinel claim | Proof | Verdict |
|---|---|---|
| $19/mo vs. $50+/mo for comparable cron coverage | Pricing page — accurate comparison | Strong — ship it |
| Purpose-built for job health, not bolted onto a platform | Entire package scope and positioning | Strong — ship it |
| Two commands to install | README and install command | Strong — ship it |
| Full observability (logs, traces, uptime) | Not a Crontinel feature | Do NOT claim — point to Better Stack for that |

### vs. Oh Dear

| Crontinel claim | Proof | Verdict |
|---|---|---|
| Covers queue health and Horizon worker state | `QueueMonitor.php`, `HorizonMonitor.php` | Strong — ship it |
| Deeper scheduler diagnostics: exit code, duration, late detection | `CronMonitor.php`, `RecordScheduledTaskRun.php` | Strong — ship it |
| Complementary, not a replacement | Both tools have distinct coverage areas | Frame as "complementary" — do not frame as "better" |

### vs. Forge Heartbeats

| Crontinel claim | Proof | Verdict |
|---|---|---|
| Forge heartbeats confirm `schedule:run` was called, not that tasks succeeded | Accurate technical distinction — Forge sees the scheduler invocation, not task outcomes | Strong — ship it |
| Per-task exit codes, late detection, run history | `CronMonitor.php`, `crontinel_runs` table | Strong — ship it |

---

## 5. Ready-to-Use Copy Bullets

These are copy-ready bullets drawn directly from code behavior. Safe to publish now.

**Installation:**
- Two commands. Dashboard live. No account required.
- `crontinel:install` publishes config and runs the migration in one step.
- Dashboard at `/crontinel`, protected by your app's existing auth middleware.

**Horizon monitoring:**
- Reads Horizon's Redis keys directly — same data source as the Horizon dashboard.
- Per-supervisor status, not just a single "Horizon is running" badge.
- Alerts separately on paused, stopped, and supervisor-down — three distinct failure modes.
- Failed jobs per minute threshold, configurable in `config/crontinel.php`.

**Cron tracking:**
- Every scheduled command tracked automatically after install — no wrapping needed.
- Exit code, execution duration, and timestamp recorded per run.
- Late detection: alerts when a command misses its window (configurable grace period).
- 30-day run history by default, configurable via `crontinel.cron.retain_days`.

**Queue monitoring:**
- Depth, failed count, and oldest job age per queue.
- Supports both Redis and database queue drivers.
- Auto-discovers queues when no watch list is configured.
- Per-queue depth and wait-time thresholds, independently configurable.

**Alerts:**
- Fires once per issue, not once per polling cycle (5-minute dedup window).
- Resolves automatically with a recovery notification when the issue clears.
- Channels: Slack (incoming webhook), email (Laravel mail), generic webhook.
- Webhook payload includes `resolved: true` — integrates with any incident management tool.

**CLI:**
- `crontinel:check` exits 1 on any active alert — pipe into CI or external monitoring pipelines.
- `--format=json` for machine-readable output.
- `--no-alerts` for read-only status checks without firing notifications.

**Open source:**
- MIT licensed. Self-host forever with no SaaS required.
- OSS package includes dashboard, CLI, Horizon monitoring, queue monitoring, cron tracking, Slack alerts, and email alerts.
- SaaS adds multi-app dashboard, longer history retention, and team access.

---

## 6. Claims to Avoid Until Shipped

Do not use these in any published copy until the corresponding code exists and is tested end-to-end:

| Claim | Reason to avoid now |
|---|---|
| "PagerDuty integration" as a named channel | No `sendPagerDuty()` — silently drops alerts. LAUNCH_AUDIT: BLOCKED. |
| "Full incident lifecycle" for PagerDuty | Not implemented anywhere in the codebase. |
| "Status page per app" | LAUNCH_AUDIT: BLOCKED on VPS + Gatus. No code in OSS package. |
| "Custom alert rules" (Team plan) | Not implemented in `AlertService.php`. PRD-level only. |
| "REST API access" (Pro/Team) | SaaS not yet live. No API routes in OSS package. |
| "14-day trial auto-starts on signup" | BLOCKED on Stripe Price IDs and VPS. |
| "Tested in production" for Slack/email/webhook | All end-to-end delivery blocked on VPS. Code ships; smoke test does not yet exist. |
| "Zero-config" as a blanket promise | Alert channels, thresholds, and env vars require configuration. Use "minimal setup" instead. |

---

## 7. Recommended Landing Page Claim Stack

If space is tight, lead with this order — each claim is fully supported by shipped code:

1. **Laravel-native scheduler, queue, and Horizon monitoring**
2. **Catches the silent failures uptime checks miss**
3. **Two commands to install, no account required**
4. **Slack, email, and webhook alerts — fires once, resolves automatically**
5. **Unlimited monitors on paid plans**

---

## 8. Quick Reference: Shipped vs. Aspirational

| Feature | Shipped in OSS | SaaS / Not Yet Shipped |
|---|---|---|
| Horizon Redis monitoring | Yes | — |
| Per-supervisor status | Yes | — |
| Queue depth (Redis + DB) | Yes | — |
| Oldest job age | Yes | — |
| Cron run recording | Yes | — |
| Late detection | Yes | — |
| CLI health check | Yes | — |
| Slack alerts | Yes (code) | End-to-end delivery pending VPS |
| Email alerts | Yes (code) | End-to-end delivery pending Resend |
| Webhook alerts | Yes (code) | End-to-end delivery pending VPS |
| PagerDuty (native) | No | Planned — use webhook workaround |
| Multi-app dashboard | No | SaaS — pending VPS |
| REST API | No | SaaS — pending VPS |
| Status page | No | SaaS — pending VPS + Gatus |
| Custom alert rules | No | Planned (Team plan) |
| 14-day trial | No | Pending Stripe + VPS |
