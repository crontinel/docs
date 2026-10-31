---
title: Analytics and Run History
description: Per-app success rate, failures, missed runs, and p50/p95 duration per job, plus filtered run history, CSV export, and an opt-in weekly email.
---

Each app has an **Analytics** page, linked from the app navigation. It shows how every job has done over a time range. It works for any runtime that sends [receipts](/check-in/recipes/).

## Ranges

Pick **24h**, **7d**, **30d**, or **90d**. Ranges longer than your plan's history retention are not shown.

Days follow the app's timezone setting. If the app has no timezone set, days are UTC.

## What it shows

Summary tiles at the top: runs, success rate, failures, and incidents.

Then one row per job:

| Column | Meaning |
|---|---|
| Runs | Runs in the range |
| Success | Share of finished runs that succeeded |
| Failed | Runs that failed |
| Outcome failed | Runs that exited 0 but failed an [outcome rule](/check-in/start-finish/) |
| Late | Runs marked late |
| Missed | Runs that never started when expected |
| p50, p95 | Median and 95th percentile duration |
| Quality pass | Share of AI-graded runs that met the pass score. Blank unless the job has a [quality check](/mcp/ai-agent-monitoring/#quality-check-ai-optional). |

A **Daily trend** chart shows success rate and p95 duration per day for each job. If the app reports queues, a **Queues (daily max)** table shows the highest depth and oldest job age per queue per day.

Missed and incident counts come from incident history. Full history starts on 2026-10-31. Before that date, only the latest incident for each alert is counted.

## Run history

**All runs** opens the run history: 50 runs per page, newest first. Filter by range, job, and status (`completed`, `failed`, `late`, `running`, or `outcome failed`). The **Quality (AI)** column shows the grade when the job has a quality check.

The dashboard's history tab also links here with **View all runs**.

## CSV export

**Export CSV** downloads the runs that match the current range and filters. Anyone who can view the app can export. An export holds up to 50,000 rows.

Columns: `id`, `command`, `status`, `outcome_status`, `exit_code`, `duration_ms`, `started_at`, `finished_at`, `attempt`, `trigger_source`.

## Weekly email

Turn on **Email me a weekly report for each app in my organizations** on your profile. It is off by default.

The email goes out on Mondays at 08:00 UTC. For each app it covers the last 7 full days in the app's timezone and shows runs, success rate, incidents, and the slowest jobs by p95. Turn it off from the same profile setting.

## Related

- [Alert channels](/alerts/channels/): where alerts go, and how to mute them
- [AI agent jobs](/mcp/ai-agent-monitoring/): guardrails and quality checks
- [Billing and plans](/billing/): plan allowances
