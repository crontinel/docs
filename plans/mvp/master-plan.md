# Crontinel MVP Master Plan

> **Updated:** 2026-06-25 — Vision clarified via Q&A session
> **Status:** Live — features built, gaps identified, tasks queued on Kanban

## One-Sentence Vision
Crontinel is a **framework-agnostic two-way cron tunnel** that both **monitors** background job execution (package→cloud) and **triggers** remote command execution (cloud→package) — with failure alerts, execution history, and retries — across Laravel, Node, Python, Go, Rust, and .NET SDKs.

## What We Decided (from Q&A)

| Decision | Choice |
|---|---|
| One job | **Both** — monitor + trigger shipped together |
| Primary user | **All developers** — Laravel, Node, Python, DevOps, AI agents |
| Top pain | **Silent failures** — "cron failed and I didn't know" |
| Direction | **Both simultaneously** — full two-way tunnel |
| Agent daemon | **Yes in MVP** — key differentiator |
| Cronhub migration | **Skip** — product first |
| Packages | **All SDKs equally** — framework-agnostic |
| PyPI | **Skip for MVP** — revisit post-MVP |
| Differentiator | **Combined tunnel + multi-SDK ecosystem** |

## Target User
Primary users are developers across all ecosystems (Laravel, Node.js, Python, Go, Rust, .NET) and DevOps/sysadmins who need to:
- Know when their cron/background jobs fail silently
- Remotely trigger job execution from the cloud
- See execution history with full logs
- Get alerted via webhook/email/Slack when something breaks

## Core Problem
Background jobs and cron tasks fail silently. There's no unified way to:
1. **Monitor** — know if a job ran, how long it took, whether it succeeded
2. **Trigger** — remotely execute commands on your server without SSH
3. **Alert** — get notified via webhook/email/Slack when things break
4. **Retry** — automatically retry failed jobs with configurable policy

## What's Already Built

### Cloud Side (app.crontinel.com)
| Area | Status |
|---|---|
| Auth (Google OAuth, GitHub OAuth, email/password, 2FA) | ✅ Live |
| Teams/Orgs (multi-tenancy, invites, roles) | ✅ Live |
| Dashboard (org overview, app count, recent activity, onboarding) | ✅ Needs UX polish |
| Apps (create/manage, API keys, per-app settings) | ✅ Live |
| Alert Channels (Email, Webhook, Slack, PagerDuty — CRUD + dispatch) | ✅ Code done, queue fix needed |
| Alert Rules (failure detection, cooldowns, routing) | ✅ Live |
| Cron History (status, duration, exit code, full log viewer) | ✅ Live |
| Retries (configurable retry policy) | ✅ Live |
| Billing (Free + Team plans, Stripe/Cashier) | ✅ Live |
| Cloud Trigger API (POST /triggers, GET /agents, etc.) | ✅ Live |
| Health (/up, /health) | ✅ Live |

### Landing (crontinel.com)
| Area | Status |
|---|---|
| Marketing (hero, features, pricing, docs) | ✅ Live |
| Pricing (Free, Team, self-host) | ✅ Live |
| Docs (quickstart, GitHub links) | ✅ Live |

### Package SDKs
| Package | Status |
|---|---|
| Laravel (crontinel/laravel) | ✅ v0.4.1 published on Packagist |
| PHP (crontinel/php) | ✅ Built |
| Node.js (@crontinel/node) | ✅ v0.1.0 on npm |
| Python (crontinel) | ✅ Built — not on PyPI (org not approved) |
| Go (github.com/crontinel/go) | ✅ Built |
| Rust (crontinel/rust) | ✅ Built |
| .NET (crontinel/dotnet-sdk) | ✅ Built |

### Agent (Trigger Direction)
| Area | Status |
|---|---|
| Laravel Agent (php artisan crontinel:agent) | ✅ Built |
| Node Agent (npx crontinel agent) | ✅ Built |
| Python Agent (crontinel agent) | ✅ Built |
| Agent Protocol (SSE stream + heartbeat + result reporting) | ✅ Built |

## Gaps to Fix for MVP

### P0 — Blocks core value delivery
1. **Dashboard UX simplification** — Too cluttered, needs cleaner layout for quick status
2. **Alert test 500** — PR #275 merged, needs live verification (queue/Redis dependency)
3. **Agent setup instructions** — No clear docs for users to install and run the agent

### P1 — Important polish
4. **Onboarding flow** — Sign up → create app → get key → connect → first run should be seamless
5. **Package READMEs** — Each SDK needs clear quickstart pointing to Crontinel cloud
6. **Trigger UI** — Dashboard needs a "Schedule trigger" button for ad-hoc remote execution

### P2 — Nice to have for MVP
7. **Dashboard stats** — Better summary cards (last 24h failures, success rate, etc.)
8. **App card redesign** — Cleaner per-app cards with meaningful status at a glance

## Out of Scope for MVP
- Status pages (deferred to post-MVP)
- Cronhub migration content/marketing
- PyPI publishing
- Custom status page branding
- Advanced team roles/permissions builder

## Success Criteria
The MVP is successful when a developer can:
1. Sign up → create app → get API key → connect package → see cron data in < 5 minutes
2. A failed cron job triggers an alert to their webhook/email/Slack automatically
3. Remotely trigger a command on their server from the Crontinel dashboard
4. View run history with exit code, duration, and full logs
