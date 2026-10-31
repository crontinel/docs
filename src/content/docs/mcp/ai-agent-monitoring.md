---
title: AI Agent Jobs
description: Monitor a scheduled AI agent like any other job, set ceilings on tokens, cost, and tool calls, and add an optional AI check of the output.
---

A scheduled AI agent is a job. It posts the same [receipt](/check-in/recipes/) as any other runtime. Crontinel then checks three things: the run happened, it produced what you expect, and it stayed inside the limits you set.

## Name and register the job

Name the job with an `agent:` prefix, such as `agent:nightly-digest`, and [register it](/check-in/schedule/). Agent jobs get longer default grace and runtime limits because model calls vary.

## Report guardrail numbers

Your agent reports its own numbers under `outcomes.metrics` on the finish receipt:

```json
{
  "command": "agent:nightly-digest",
  "status": "completed",
  "exit_code": 0,
  "output": "...",
  "outcomes": {
    "metrics": {
      "items_produced": 12,
      "tokens_used": 48210,
      "cost_usd": 0.31,
      "tool_calls": 17
    }
  }
}
```

Then add one outcome rule per number. The **Outcome rules** page in the app has presets for each:

| Preset | Rule | Default threshold |
|---|---|---:|
| At least 1 item produced | `items_produced` numeric minimum | 1 |
| Token ceiling | `tokens_used` numeric maximum | 200000 |
| Cost ceiling | `cost_usd` numeric maximum | 5 |
| Tool-call ceiling (loop detection) | `tool_calls` numeric maximum | 50 |

A run over a ceiling fails its outcome rule, even on exit code 0. Change the thresholds to fit your agent. These rules check numbers your agent reports. Crontinel does not meter model usage.

## Quality check (AI, optional)

A quality check asks a model to grade a run's `output` against your rubric. It is off until you add one for a job.

To add one, open **Outcome rules** and fill in **Quality check (AI, optional)**:

- **Job name**, or the command when the job has no name
- **Rubric**: plain language, up to 1,000 characters
- **Pass score**: 1 to 5
- **Consent**: the run's output and your rubric are sent to Crontinel's hosted model provider (Cloudflare Workers AI) for every graded run. Do not turn this on for output that contains secrets or personal data.

Hosted AI must also be on for the organization. An owner turns it on from **Assistance**. An app can have up to 10 quality checks.

### How grading works

- Only completed runs with non-empty `output` are graded. The first 6,000 characters are sent.
- The model returns a score from 1 to 5. A score at or above the pass score is a pass.
- A score below the pass score opens a separate quality alert. A later passing run clears only that alert.
- The grade is advisory. It never changes the run's status and never resolves other alerts. Alerts for failed, late, or missed runs do not wait for it.
- A reply that is not a valid grade shows as **unknown**.
- When the monthly grade allowance is used up or the model is unavailable, the grade shows as **unavailable** and no alert fires.

### Grade allowance

Grades have their own monthly allowance, separate from hosted AI investigation starts:

| Plan | Quality grades per month |
|---|---:|
| Free | 50 |
| Starter | 500 |
| Pro | 2,000 |
| Max | 5,000 |

The allowance resets at 00:00 UTC on the 1st. A grade that fails still counts. Usage shows on the [Billing page](https://app.crontinel.com/team/billing).

### Where the grade shows

- The **Quality (AI)** column in [run history](/analytics/#run-history)
- The **Quality pass** rate in [Analytics](/analytics/)
- The MCP `list_runs` tool, as `quality` with `status`, `score`, `pass_score`, and `advisory: true`. The model's reasons and the output are not returned.
- Incident evidence, as the quality status and score

## Related

- [Register expected jobs](/check-in/schedule/): catch an agent run that never starts
- [Start and finish receipts](/check-in/start-finish/): catch an agent run that never finishes
- [Ingest reference](/reference/api/#post-ingestcron): every receipt field
- [Billing and plans](/billing/): monthly allowances
