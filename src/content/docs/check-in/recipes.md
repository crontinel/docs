---
title: Check-in from any runtime
description: Send one HTTP outcome receipt from curl, Python, Node, cron, GitHub Actions, Sidekiq, or a scheduled agent. Laravel is the deep package path.
---

Crontinel is an outcome monitor for background work in whatever runtime already runs it. Every runtime posts the same JSON receipt. Exit code 0 can still fail an outcome rule when `processed_records` is 0 or missing and the rule requires work.

Use the **app ingest key** (`CRONTINEL_INGEST_KEY`). It is not an MCP key. A monitoring failure must not fail the business job.

## Universal receipt

### curl

```bash
export CRONTINEL_INGEST_KEY=your-app-ingest-key
curl -sS -X POST "https://app.crontinel.com/api/v1/ingest/cron" \
  -H "Authorization: Bearer $CRONTINEL_INGEST_KEY" \
  -H "Content-Type: application/json" \
  -d '{"request_key":"run-1","command":"reports:generate","status":"completed","exit_code":0,"started_at":"2026-10-06T12:00:00Z","finished_at":"2026-10-06T12:00:05Z","outcomes":{"metrics":{"processed_records":0}}}'
```

### Python

Copy `outcome_checkin.py` from the [Crontinel workspace](https://github.com/crontinel/workspace) (`scripts/outcome_checkin.py`). There is no supported PyPI package for this path.

```bash
python3 outcome_checkin.py \
  --command reports:generate \
  --request-key run-1 \
  --exit-code 0 \
  --started-at 2026-10-06T12:00:00Z \
  --finished-at 2026-10-06T12:00:05Z \
  --records 0 \
  --url https://app.crontinel.com \
  --api-key "$CRONTINEL_INGEST_KEY"
```

### Node

```js
await fetch("https://app.crontinel.com/api/v1/ingest/cron", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.CRONTINEL_INGEST_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    request_key: "run-1",
    command: "reports:generate",
    status: "completed",
    exit_code: 0,
    started_at: "2026-10-06T12:00:00Z",
    finished_at: "2026-10-06T12:00:05Z",
    outcomes: { metrics: { processed_records: 0 } },
  }),
});
```

## System cron

Wrap the job, capture exit code and times, post the receipt, and keep monitoring from failing the job (`|| true`).

```bash
STARTED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
set +e
/usr/local/bin/generate-reports
EXIT_CODE=$?
set -e
FINISHED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
python3 outcome_checkin.py \
  --command reports:generate \
  --request-key "reports-$(date -u +%Y%m%dT%H%M%SZ)" \
  --exit-code "$EXIT_CODE" \
  --started-at "$STARTED_AT" \
  --finished-at "$FINISHED_AT" \
  --records "${RECORDS:-0}" \
  --url https://app.crontinel.com \
  --api-key "$CRONTINEL_INGEST_KEY" \
  || true
exit "$EXIT_CODE"
```

## GitHub Actions

Store `CRONTINEL_INGEST_KEY` as a repository secret. After the job step, post the same receipt (see the curl or Python examples). Use a unique `request_key` per run (for example `${{ github.run_id }}`).

## Sidekiq / Ruby

Post the same JSON with `Net::HTTP`. There is no supported gem for this path. Rescue so monitoring never fails the job.

## Scheduled agents

Reuse the same rules: report items produced as `processed_records` (or artifact time as `latest_artifact`). An empty successful agent run is a failed outcome when the rule requires work. This is not a separate AI-agent product.

## Laravel (deep integration)

When you need schedule attach, queue depth, and Horizon freshness, install the Composer package:

```bash
composer require crontinel/laravel
php artisan crontinel:install
```

See [Laravel](/sdks/laravel/) and [Installation](/installation/). Do not tell a non-Laravel operator to install Composer.

## Verify

1. Send `processed_records: 0` with exit code 0.
2. Confirm the outcome alert (business result failed).
3. Send a later run with a passing count and confirm recovery.

Coverage stays unknown until you name the job. Crontinel does not read crontab or an agent runner.

## Not claimed here

- Language SDK parity for Node, Python, Go, Rust, Ruby, or .NET
- Crontab or Kubernetes auto-discovery
- LLM spend or tracing products
