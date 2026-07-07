# Task Sheet: Execution history and retries

**Feature:** 7 — Execution history and retries
**Stage:** 3 — Core cron experience

## Files to inspect
- `app/app/Models/CronRun.php`
- `app/database/migrations/2026_04_06_131604_create_cron_runs_table.php`
- `app/resources/views/livewire/app-dashboard.blade.php`
- `app/resources/views/apps/show.blade.php`
- `app/routes/web.php`

## To do
- [x] Define the basic one-line title plus full log history requirement.
- [x] Decide where that history appears in the app surface.
- [x] Keep the history lightweight but useful.
- [x] Define retry behavior for failed cron jobs.
- [x] Keep retry timing and failure rules configurable from the plan.
- [x] Make retries part of the core behavior, not a later addon.
- [x] Make the history and retry story line up with the run model.

## Completion note
- 2026-06-06: Feature 7 implementation definition is recorded in `docs/plans/mvp/features/07-history-and-retries.md`, including history UI, full-log behavior, retry eligibility, retry config, and data-model needs.

## Implementation steps
1. Inspect `app/app/Models/CronRun.php` and the cron-run migration to determine what data is already available for history and retries.
2. Review `app/resources/views/livewire/app-dashboard.blade.php` and `app/resources/views/apps/show.blade.php` to decide where the history summary and full log should live.
3. Review `app/routes/web.php` to see whether the history surface belongs on the dashboard, the app page, or both.
4. Define the history format as a one-line summary title plus the full execution log.
5. Record the retry behavior in plain language, including what counts as a failed run and what should happen next.
6. Add a note about which retry settings must be user-configurable from the MVP start.
7. Keep the history/retry plan aligned with the trigger result data so nothing has to be invented later.

## Acceptance criteria
- Users can see both a summary and the full log.
- The history view supports troubleshooting.
- Failed jobs have a clear retry path.
- Retry behavior is explicitly documented.
- The history structure works with the stored run data.
