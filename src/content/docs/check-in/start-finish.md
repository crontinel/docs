---
title: Start and finish receipts
description: Send a running receipt when a job starts and a completed or failed receipt when it ends. Same request_key, any runtime.
---

One receipt after the job finishes is enough for outcome rules. Add a `running` receipt at the start when you also want an alert for a job that starts and never ends.

## The pair

Use the same `request_key` for both. The key identifies one execution.

```bash
KEY="nightly-$(date -u +%Y%m%dT%H%M%SZ)"
STARTED="$(date -u +%FT%TZ)"
post() {
  curl -sS -m 5 -X POST "https://app.crontinel.com/api/v1/ingest/cron" \
    -H "Authorization: Bearer $CRONTINEL_INGEST_KEY" \
    -H "Content-Type: application/json" -d "$1" || true
}

post "{\"request_key\":\"$KEY\",\"command\":\"nightly-import\",\"status\":\"running\",\"started_at\":\"$STARTED\"}"

./nightly-import.sh
CODE=$?
RECORDS=$(cat /tmp/nightly-import.count 2>/dev/null || echo 0)

STATUS=completed; [ "$CODE" -ne 0 ] && STATUS=failed
post "{\"request_key\":\"$KEY\",\"command\":\"nightly-import\",\"status\":\"$STATUS\",\"exit_code\":$CODE,\"started_at\":\"$STARTED\",\"finished_at\":\"$(date -u +%FT%TZ)\",\"outcomes\":{\"metrics\":{\"processed_records\":$RECORDS}}}"
exit $CODE
```

Rules for the pair:

- `started_at` must be the same in both receipts. A different identity under the same key returns 409.
- A finished run (`completed` or `failed`) cannot be changed or reopened. Use a new key for a retry.
- A late `running` receipt after the finish is ignored.
- `|| true` and `-m 5` keep a monitoring failure from failing the business job.

## What each receipt unlocks

| You send | Alert you get |
|---|---|
| Only the finish receipt | Outcome failures (exit code, `processed_records`). |
| Finish receipt plus a [registered schedule](/check-in/schedule/) | Also: the run never started. |
| `running` plus a registered schedule | Also: the run started and never finished within `max_runtime_seconds`. |

Fields are listed in the [ingest reference](/reference/api/#post-ingestcron).
