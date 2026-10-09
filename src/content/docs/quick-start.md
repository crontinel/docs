---
title: Quick Start
description: Send one HTTP outcome receipt from any runtime, then optionally install the Laravel package for schedule, queue, and Horizon.
---

Every runtime uses the same HTTP receipt. First-class paths: **curl**, **Node**, **Python**, **Sidekiq**, and **GitHub Actions**. Laravel is the deep integration when you need schedule attach, queue depth, and Horizon.

## 1. Create an app

1. Sign up at [app.crontinel.com](https://app.crontinel.com/register).
2. Create an app and copy its **ingest key**. That key is not an MCP key.
3. Put it in the job environment as `CRONTINEL_INGEST_KEY`.

## 2. Send a receipt

Pick one path. Full recipes: [Check-in from any runtime](/check-in/recipes/).

**curl**

```bash
curl -sS -X POST "https://app.crontinel.com/api/v1/ingest/cron" \
  -H "Authorization: Bearer $CRONTINEL_INGEST_KEY" \
  -H "Content-Type: application/json" \
  -d '{"request_key":"run-1","command":"reports:generate","status":"completed","exit_code":0,"started_at":"2026-10-06T12:00:00Z","finished_at":"2026-10-06T12:00:05Z","outcomes":{"metrics":{"processed_records":0}}}'
```

**Python** — use `outcome_checkin.py` from the workspace (no supported PyPI package on this path).

**Node** — `fetch` the same JSON body (no supported npm package on this path).

**Sidekiq / Ruby** — thin `Net::HTTP` post after the job (no supported gem on this path).

**GitHub Actions** — repository secret + curl (or Python) after the job step.

## 3. Verify

1. Confirm the run appears on the dashboard.
2. With a minimum rule of 1, `processed_records: 0` should open an outcome alert even when exit code is 0.
3. Send a later count that passes and confirm recovery.

## Laravel deep integration

If you run Laravel and want scheduler attach, queue depth, and Horizon:

```bash
composer require crontinel/laravel
php artisan crontinel:install
```

See [Installation](/installation/) and [Laravel](/sdks/laravel/).

## Next steps

- [Check-in recipes](/check-in/recipes/) for cron, GitHub Actions, Sidekiq, and agents
- [Alert channels](/alerts/channels/)
- [Cron monitors](/monitors/cron/)
- [MCP overview](/mcp/overview/) for your coding assistant
