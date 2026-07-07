# Crontinel MVP Vision — Final (2026-06-25)

## The One-Sentence Vision
Crontinel is a **framework-agnostic two-way cron tunnel** that both **monitors** cron/background job execution (package→cloud) and **triggers** remote command execution (cloud→package) — all with failure alerts, execution history, and retries, across **multiple SDK ecosystems**.

## Answers Summary

| # | Question | Answer |
|---|---|---|
| 1 | One job to do better than anyone? | **Both** — monitor + trigger (full tunnel) |
| 2 | Primary user? | **All developers** — Laravel, DevOps, Node, Python, AI agents |
| 3 | Top pain? | **Silent failures** — "my cron failed and I didn't know" |
| 4 | Focus one direction? | **Both simultaneously** — ship monitoring and triggering together |
| 5 | Agent daemon in MVP? | **Yes** — it's the differentiator, without it we're just another ping monitor |
| 6 | Cronhub migration window? | **Product first** — don't chase the marketing wave now |
| 7 | Which packages? | **All built** — Laravel, Node, Python, Go, Rust, .NET |
| 8 | PyPI publishing? | **Not now** — revisit post-MVP |
| 9 | Differentiator? | **Combined monitor+trigger** + **multi-SDK ecosystem** |
| 10 | Laravel-first? | **Framework-agnostic** — treat all SDKs equally |

## Key MVP Priorities (from answers)

### Must Have
- ✅ Reliable **monitoring** — package reports cron runs, dashboard shows history
- ✅ **Failure alerts** — webhook/email/Slack when a job fails or misses
- ✅ **Cloud triggers** — agent daemon receives commands via SSE, executes, reports back
- ✅ **Execution history** — run log with status, duration, exit code, full output
- ✅ **Multi-SDK** — Laravel, Node, Python, Go, Rust, .NET (PyPI blocked, skip for now)
- ✅ **Easy onboarding** — sign up → create app → get key → connect package → see data

### Needs Fixing
- ❌ Queue/Redis dependency making alert test crash — PR #275 merged, needs live verification
- ❌ Dashboard UX — needs simplification (recognized earlier)
- ❌ Agent daemon needs clearer setup instructions for users

### Explicitly Out of Scope (for MVP)
- Promoting Cronhub migration content
- PyPI publishing
- Status pages (already deferred)
