---
title: Check-in from any runtime
description: Five first-class runtimes post one HTTP outcome receipt — curl, Node, Python, Sidekiq, and GitHub Actions. Laravel is the deep package path.
---

Crontinel is an outcome monitor for background work in whatever runtime already runs it. Every runtime posts the same JSON receipt. Exit code 0 can still fail an outcome rule when `processed_records` is 0 or missing and the rule requires work.

**First-class runtimes on this page:** system cron (curl), Node.js, Python, Sidekiq/Ruby, and GitHub Actions. Laravel is the maintained deep package for schedule attach, queue depth, and Horizon — not a requirement for outcome monitoring.

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

## Node scheduler (node-cron, BullMQ)

Wrap the scheduled function. This is an HTTP example, not an npm package.

```js
import cron from "node-cron";

async function postReceipt({ requestKey, command, exitCode, startedAt, records }) {
  const body = {
    request_key: requestKey,
    command,
    status: exitCode === 0 ? "completed" : "failed",
    exit_code: exitCode,
    started_at: startedAt,
    finished_at: new Date().toISOString(),
    outcomes: { metrics: { processed_records: records } },
  };
  try {
    await fetch("https://app.crontinel.com/api/v1/ingest/cron", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CRONTINEL_INGEST_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Monitoring must not fail the business job.
  }
}

cron.schedule("0 3 * * *", async () => {
  const startedAt = new Date().toISOString();
  let exitCode = 0;
  let records = 0;
  try {
    records = await generateReports();
  } catch (error) {
    exitCode = 1;
    throw error;
  } finally {
    await postReceipt({ requestKey: `node-reports-${startedAt}`, command: "reports:generate", exitCode, startedAt, records });
  }
});
```

For BullMQ, call `postReceipt` from the worker's `completed` and `failed` handlers and use the job id as `request_key`.

## Python schedulers (APScheduler, Celery)

Both wrap the task the same way. `build_receipt` comes from `outcome_checkin.py` (see the Python section above).

```python
import json, os, urllib.request
from datetime import datetime, timezone
from outcome_checkin import build_receipt

def now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def post_receipt(request_key, exit_code, started, records):
    body = build_receipt(
        command="reports:generate",
        request_key=request_key,
        exit_code=exit_code,
        started_at=started,
        finished_at=now(),
        processed_records=records,
    )
    req = urllib.request.Request(
        "https://app.crontinel.com/api/v1/ingest/cron",
        data=json.dumps(body).encode(),
        headers={
            "Authorization": "Bearer " + os.environ["CRONTINEL_INGEST_KEY"],
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        urllib.request.urlopen(req, timeout=5)
    except Exception:
        pass  # Monitoring must not fail the business job.

# APScheduler
@sched.scheduled_job("cron", hour=3)
def reports_generate():
    started, exit_code, records = now(), 0, 0
    try:
        records = run_reports()
    except Exception:
        exit_code = 1
        raise
    finally:
        post_receipt(f"apscheduler-{started}", exit_code, started, records)

# Celery (schedule with Beat as you already do)
@shared_task(bind=True)
def reports_generate(self):
    started, exit_code, records = now(), 0, 0
    try:
        records = run_reports()
        return records
    except Exception:
        exit_code = 1
        raise
    finally:
        post_receipt(f"celery-{self.request.id}", exit_code, started, records)
```

Crontinel does not discover Celery Beat or APScheduler entries. Name the jobs you expect with [a registered schedule](/check-in/schedule/).

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

Store `CRONTINEL_INGEST_KEY` as a repository secret. After the job step, post the same receipt. Use a unique `request_key` per run.

```yaml
- name: Report outcome
  env:
    CRONTINEL_INGEST_KEY: ${{ secrets.CRONTINEL_INGEST_KEY }}
  run: |
    curl -sS -X POST "https://app.crontinel.com/api/v1/ingest/cron" \
      -H "Authorization: Bearer $CRONTINEL_INGEST_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"request_key\":\"gha-${{ github.run_id }}-${{ github.run_attempt }}\",\"command\":\"reports:generate\",\"status\":\"completed\",\"exit_code\":0,\"started_at\":\"$(date -u +%FT%TZ)\",\"outcomes\":{\"metrics\":{\"processed_records\":0}}}" \
      || true
```

## Sidekiq / Ruby

Post the same JSON with `Net::HTTP`. There is no supported gem for this path. Rescue so monitoring never fails the job.

```ruby
require "json"
require "net/http"
require "uri"

begin
  uri = URI("https://app.crontinel.com/api/v1/ingest/cron")
  req = Net::HTTP::Post.new(uri)
  req["Authorization"] = "Bearer #{ENV.fetch("CRONTINEL_INGEST_KEY")}"
  req["Content-Type"] = "application/json"
  req.body = {
    request_key: "sidekiq-#{jid}",
    command: "reports:generate",
    status: "completed",
    exit_code: 0,
    started_at: started,
    finished_at: Time.now.utc.iso8601,
    outcomes: { metrics: { processed_records: records } },
  }.to_json
  Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http| http.request(req) }
rescue StandardError
  # Monitoring must not fail the business job.
end
```

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
