# Feature 7: Execution history and retries

**Stage:** 3 — Core cron experience

**Goal:** Give users enough run history to understand what happened and what retried.

## Task group A: History surface
- Define the basic one-line title plus full log history requirement.
- Decide where that history appears in the app surface.
- Keep the history lightweight but useful.

**Acceptance criteria**
- Users can see both a summary and the full log.
- The history view supports troubleshooting.

## Task group B: Retry behavior
- Define retry behavior for failed cron jobs.
- Keep retry timing and failure rules configurable from the plan.
- Make retries part of the core behavior, not a later addon.

**Acceptance criteria**
- Failed jobs have a clear retry path.
- Retry behavior is explicitly documented.

## Implementation definition

### Current baseline to reuse
- `CronRun` already stores command, output, status, exit code, duration, and timestamps.
- App detail Livewire dashboard already shows recent cron runs with command, status, duration, and started time.
- No inspected view currently exposes a dedicated full-log drawer/detail view.
- No inspected model fields currently link retry attempts to an original run.

### History surface
- App detail should include a `Run history` section below the app setup/configuration areas.
- Organization dashboard recent activity should show summarized latest run results, but full troubleshooting belongs on the app detail/history view.
- Each history item must show:
  - One-line title: command/job name.
  - Status badge.
  - Started time.
  - Duration.
  - Exit code when present.
  - Retry attempt label when present.
  - Action: `View log`.
- Full log should open in a modal/drawer/details panel and show the stored `output` field with safe wrapping and copy support.
- Empty text: `No cron runs yet. Runs will appear here after the package reports activity.`

### Retry behavior
- A run is retry-eligible when status is `failed` or when failure rules classify it as missed/late and retry is enabled.
- MVP default retry policy: off until enabled in alert/failure add-ons, or enabled with a small safe default if product chooses during implementation.
- Minimal configurable retry fields:
  - Enabled/disabled.
  - Max attempts.
  - Delay between attempts.
  - Which statuses trigger retry: failed and/or late.
- Retry attempt should create a new `CronRun` linked to the original run if the model has linkage, or include attempt metadata until linkage is added.
- Retry outcome must feed the same history and alert paths as a normal run.

### Model/data needs
- Existing fields support basic history.
- Implementation should consider additive fields for retry support: `trigger_source`, `attempt_number`, `parent_run_id`, and/or `retry_of_id`.
- Do not overload `command` with retry metadata; keep title clean.
- Cap stored logs and avoid exposing secrets in logs.

### Implementation handoff
- Code target: `/Users/ray/Work/crontinel/app`.
- First files likely to change: `CronRun.php`, additive cron-runs migration, `resources/views/livewire/app-dashboard.blade.php`, possibly a dedicated history component, and feature tests.
- Add tests for full-log visibility, retry metadata display, failed-run retry eligibility, and status consistency.
- If actual re-execution requires cloud trigger infrastructure not present locally, implement/store the retry configuration and mark execution wiring as a blocker rather than inventing behavior.