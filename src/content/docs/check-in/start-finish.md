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
| Only the finish receipt | Outcome failures (exit code, `processed_records`) and unknown outcomes when the metric is missing. |
| Finish receipt plus a [registered schedule](/check-in/schedule/) | Also: the run never started. |
| `running` plus a registered schedule | Also: the run started and never finished within `max_runtime_seconds`. |

Fields are listed in the [ingest reference](/reference/api/#post-ingestcron). For jobs that can only run curl, the [ping URL](/check-in/ping-urls/) of a schedule does the same without an API key.

## Outcome rules and missing evidence

An outcome rule checks a metric or timestamp from the finish receipt, for example `processed_records` at least 1. Each completed run gets one of three outcome results:

| Outcome | When |
|---|---|
| `passed` | Every rule had its evidence and met it. |
| `failed` | At least one rule had its evidence and did not meet it. |
| `unknown` | No rule failed, but at least one rule's metric or timestamp was not in the receipt. |

Unknown is not success. It is never shown in green, on the dashboard, in run history, in analytics, or over MCP.

### Missing-value policy

Each rule has a setting for missing evidence, under **When the evidence is missing** on the **Outcome rules** page:

- **Unknown** (default). The run's outcome is unknown. Crontinel opens an **outcome unknown** alert with the text "No evidence received for `<metric>`". It is separate from the outcome-failed alert. It recovers on the next run whose receipt includes the evidence. An unknown run does not close an open outcome-failed alert.
- **Fail the rule.** Missing evidence fails the rule, as a value below the minimum would. Use it when a missing number means the job is broken.

Rules created before this setting existed use **Unknown**.
