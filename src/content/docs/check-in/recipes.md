---
title: Check-in from any runtime
description: Five first-class runtimes post one HTTP outcome receipt — curl, Node, Python, Sidekiq, and GitHub Actions. Laravel is the deep package path.
---

Crontinel is an outcome monitor for background work in whatever runtime already runs it. Every runtime posts the same JSON receipt. Exit code 0 can still fail an outcome rule when `processed_records` is 0 and the rule requires work. If the number is missing, the outcome is [unknown](/check-in/start-finish/#outcome-rules-and-missing-evidence), never healthy.

**First-class runtimes on this page:** system cron (curl), Node.js, Python, Sidekiq/Ruby, and GitHub Actions. Laravel is the maintained deep package for schedule attach, queue depth, and Horizon — not a requirement for outcome monitoring.

Use the **app ingest key** (`CRONTINEL_INGEST_KEY`). It is not an MCP key. A monitoring failure must not fail the business job.

The examples under **Universal receipt** show the receipt itself. To catch a job that crashes, wrap the job so it sends `failed` with its exit code instead of nothing: see the runtime sections below. A job that crashes before it sends a receipt is otherwise invisible unless you also [register its schedule](/check-in/schedule/).

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

Download `outcome_checkin.py` once. It uses only the Python standard library (3.8+). There is no supported PyPI package for this path.

```bash
curl -fsSLO https://docs.crontinel.com/outcome_checkin.py
```

No `curl`, as on slim container images? Fetch it with Python. Send a `User-Agent`: the docs site refuses Python's default one.

```bash
python3 -c "import urllib.request as u; r = u.Request('https://docs.crontinel.com/outcome_checkin.py', headers={'User-Agent': 'crontinel-checkin'}); open('outcome_checkin.py', 'wb').write(u.urlopen(r).read())"
```

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
        post_receipt(f"celery-{self.request.id}-{started}", exit_code, started, records)
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

Store `CRONTINEL_INGEST_KEY` as a repository secret. Put this step last. GitHub skips later steps after a failed step unless they say `if: always()`, so without it a failed workflow sends nothing. `job.status` decides whether the receipt says `completed` or `failed`. Replace the `0` with your count. The `request_key` uses `run_id` and `run_attempt`, so a re-run does not collide. `|| true` keeps a Crontinel outage from failing the workflow.

```yaml
- name: Report outcome
  if: always() # also runs when an earlier step failed
  env:
    CRONTINEL_INGEST_KEY: ${{ secrets.CRONTINEL_INGEST_KEY }}
    JOB_STATUS: ${{ job.status }}
  run: |
    status=completed; code=0; outcomes=',"outcomes":{"metrics":{"processed_records":0}}' # replace 0 with your count
    if [ "$JOB_STATUS" != success ]; then status=failed; code=1; outcomes=''; fi
    curl -sS -m 10 -X POST "https://app.crontinel.com/api/v1/ingest/cron" \
      -H "Authorization: Bearer $CRONTINEL_INGEST_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"request_key\":\"gha-${{ github.run_id }}-${{ github.run_attempt }}\",\"command\":\"reports:generate\",\"status\":\"$status\",\"exit_code\":$code,\"started_at\":\"$(date -u +%FT%TZ)\"$outcomes}" \
      || true
```

## Sidekiq / Ruby

Wrap the job. A completed run sends the count; a job that raises sends `failed` and re-raises, so Sidekiq still retries as usual. The receipt method rescues, so a Crontinel problem never fails or mislabels the job. There is no supported gem for this path.

```ruby
require "net/http"
require "json"
require "time"

class ReportsGenerateJob
  include Sidekiq::Job

  def perform
    started = Time.now.utc.iso8601
    records = Reports.generate! # return how many records it processed
    crontinel_receipt(started, "completed", 0, records)
  rescue StandardError
    crontinel_receipt(started, "failed", 1, nil)
    raise # Sidekiq still sees the failure and retries as usual
  end

  private

  def crontinel_receipt(started, status, exit_code, records)
    uri = URI("https://app.crontinel.com/api/v1/ingest/cron")
    req = Net::HTTP::Post.new(uri)
    req["Authorization"] = "Bearer #{ENV.fetch("CRONTINEL_INGEST_KEY")}"
    req["Content-Type"] = "application/json"
    body = { request_key: "sidekiq-#{jid}-#{started}", command: "reports:generate", status: status,
             exit_code: exit_code, started_at: started, finished_at: Time.now.utc.iso8601 }
    body[:outcomes] = { metrics: { processed_records: records } } unless records.nil?
    req.body = body.to_json
    Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http| http.request(req) }
  rescue StandardError
    # Monitoring must never fail the job.
  end
end
```

A failed run carries no count, so it raises the failed alert and not also an outcome alert.

Nothing changes when `sidekiq-cron` or `sidekiq-scheduler` enqueues the job: the receipt lives in `perform`, so scheduled and manual runs report the same way. Crontinel does not read their schedules. Register the job with [a schedule](/check-in/schedule/) and a stopped Sidekiq process alerts as a run that never started. Sidekiq's default retries send one `failed` receipt per attempt, so a crashing job shows several failed runs and one alert.

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
