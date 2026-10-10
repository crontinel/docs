---
title: Register expected jobs over HTTP
description: Name the jobs you run and their cron schedule with one POST. Crontinel then alerts when a run never starts or never finishes, from any runtime.
---

A receipt tells Crontinel a job ran. Registering the job tells Crontinel it **should** run. With both, you get an alert when a run never starts, even if nothing was posted.

No Laravel package is needed. Use the same **app ingest key** as the [check-in recipes](/check-in/recipes/).

## Register a job

```bash
curl -sS -X POST "https://app.crontinel.com/api/v1/ingest/schedule" \
  -H "Authorization: Bearer $CRONTINEL_INGEST_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "named_by_user",
    "tasks": [{
      "command": "nightly-import",
      "job_name": "nightly-import",
      "expression": "0 2 * * *",
      "timezone": "UTC",
      "grace_seconds": 300,
      "max_runtime_seconds": 3600,
      "counted_minimum": 1
    }]
  }'
```

| Field | Required | Meaning |
|---|---|---|
| `source` | yes | `named_by_user` for HTTP runtimes. |
| `tasks[].command` | yes | The exact `command` your receipts send. Runs are matched on it. |
| `tasks[].job_name` | no | Stable name that survives a command change. |
| `tasks[].expression` | no | Five-field cron expression. Without it the job is inventory only and no missed-run check runs. |
| `tasks[].timezone` | no | IANA time zone for the expression. Default `UTC`. |
| `tasks[].grace_seconds` | no | How late a start may be before it alerts. Default `300`. |
| `tasks[].max_runtime_seconds` | no | How long a `running` receipt may stay open before it alerts as unfinished. Default `3600`. |
| `tasks[].counted_minimum` | no | Creates a `processed_records` rule: fewer than this fails the run even on exit 0. |

The response lists `created`, `unchanged`, `activated` (an existing named job that gained its schedule), and `skipped` (plan limit). Posting the same body again is safe.

## Node and Python

```js
await fetch("https://app.crontinel.com/api/v1/ingest/schedule", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.CRONTINEL_INGEST_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    source: "named_by_user",
    tasks: [{ command: "nightly-import", expression: "0 2 * * *", counted_minimum: 1 }],
  }),
});
```

```python
import json, os, urllib.request

req = urllib.request.Request(
    "https://app.crontinel.com/api/v1/ingest/schedule",
    data=json.dumps({
        "source": "named_by_user",
        "tasks": [{"command": "nightly-import", "expression": "0 2 * * *", "counted_minimum": 1}],
    }).encode(),
    headers={
        "Authorization": f"Bearer {os.environ['CRONTINEL_INGEST_KEY']}",
        "Content-Type": "application/json",
    },
)
urllib.request.urlopen(req, timeout=5)
```

## What happens next

- Checking starts when you register. Earlier occurrences are not checked.
- If no receipt with that `command` starts between the due time and the grace period, a **cron never started** alert opens. It resolves once the next scheduled run is observed.
- If a `running` receipt is still open after `max_runtime_seconds`, a **cron never finished** alert opens. See [start and finish receipts](/check-in/start-finish/).
- `check_monitoring_coverage` over MCP names the registered jobs instead of reporting the inventory as unknown. It does not read crontab or an agent runner.

Registering is separate from the Laravel `php artisan crontinel:schedule` command, which reports a Laravel schedule as passive inventory.
