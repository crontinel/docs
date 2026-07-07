# Task Sheet: Cron trigger execution

**Feature:** 6 — Cron trigger execution
**Stage:** 3 — Core cron experience

## Files to inspect
- `app/routes/api.php`
- `app/app/Models/CronRun.php`
- `app/database/migrations/2026_04_06_131604_create_cron_runs_table.php`
- `app/crontinel`
- `app/resources/views/livewire/app-dashboard.blade.php`

## To do
- [x] Define the core cron trigger flow from Crontinel services.
- [x] Capture the request/result lifecycle at a high level.
- [x] Keep the trigger path aligned with the product promise.
- [x] Define what result data is stored when a run finishes.
- [x] Make sure run results can feed history, alerts, and retries.
- [x] Keep the data model simple enough for MVP.
- [x] Make the trigger outcome easy to reuse from other features.

## Completion note
- 2026-06-06: Feature 6 implementation definition is recorded in `docs/plans/mvp/features/06-cron-trigger-execution.md`, including trigger lifecycle, minimum result fields, status consistency, and app repo handoff. `app/crontinel` was confirmed to be a SQLite database file, not source code.

## Implementation steps
1. Inspect `app/routes/api.php` and `app/crontinel` to see how cron trigger requests enter the system.
2. Inspect `app/app/Models/CronRun.php` and `app/database/migrations/2026_04_06_131604_create_cron_runs_table.php` to understand the run record shape.
3. Review `app/resources/views/livewire/app-dashboard.blade.php` to see how run status should be presented back to users.
4. Define the trigger lifecycle in the plan as request received, run created, run completed, and result stored.
5. Identify the minimum result fields needed for downstream history, alerting, and retry logic.
6. Record any timing or status labels that must stay consistent across the product.
7. Keep the trigger path focused on the core promise rather than adding later-stage routing complexity.

## Acceptance criteria
- The plan names the primary cron trigger behavior.
- The trigger path is the first class core feature.
- A run has a clear completion result.
- Later features can reuse that result data.
- The run lifecycle is understandable without reading later-stage docs.
