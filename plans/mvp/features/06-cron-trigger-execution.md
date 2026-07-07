# Feature 6: Cron trigger execution

**Stage:** 3 — Core cron experience

**Goal:** Make the core product action—triggering a cron job—fully visible in the plan.

## Task group A: Trigger path
- Define the core cron trigger flow from Crontinel services.
- Capture the request/result lifecycle at a high level.
- Keep the trigger path aligned with the product promise.

**Acceptance criteria**
- The plan names the primary cron trigger behavior.
- The trigger path is the first class core feature.

## Task group B: Result capture
- Define what result data is stored when a run finishes.
- Make sure run results can feed history, alerts, and retries.
- Keep the data model simple enough for MVP.

**Acceptance criteria**
- A run has a clear completion result.
- Later features can reuse that result data.

## Implementation definition

### Current baseline to reuse
- API ingest route `POST /api/v1/ingest/cron` already records cron run results with API-key auth.
- `CronRun` currently stores app, command, exit code, duration, output, start time, finish time, and status.
- Status labels already available: `running`, `completed`, `failed`, `late`.
- `IngestController@cron` also emits a `MonitorEvent` with `event_type = cron_run`, enabling activity feeds and alerts.
- `app/crontinel` is a SQLite database file in this checkout, not a trigger script or source file to edit.

### MVP trigger behavior
- Primary MVP behavior: Crontinel cloud service initiates or receives a scheduled cron execution request and stores the result as a first-class `CronRun`.
- MVP should stay focused on cloud cron triggering. Local-host routing and arbitrary remote endpoint orchestration remain later-stage unless already implemented safely.
- A trigger request should identify the app, cron command/job title, intended schedule/time, and any idempotency or request key needed to avoid duplicate records.

### Run lifecycle
1. **Request received**: authenticated by app API key or trusted internal service identity.
2. **Run created**: status starts as `running` or equivalent pending/running state with command/title and start timestamp.
3. **Execution/result received**: package or service reports finish timestamp, exit code, duration, output/log, and status.
4. **Result stored**: `CronRun` and corresponding `MonitorEvent` are persisted.
5. **Downstream fan-out**: history, retry evaluation, and failure alert rules read from the stored result.

### Minimum result data
- App ID.
- One-line title/command.
- Status: running, completed, failed, late.
- Started at and finished at.
- Duration in milliseconds.
- Exit code when available.
- Full output/log, capped to a safe size.
- Trigger source: package, cloud scheduler, manual test, or retry. This is not currently in the model and should be considered for implementation.
- Retry metadata: attempt number and parent run ID. This is not currently in the model and can be added during retry implementation if not needed immediately.

### Consistency rules
- Keep `failed` as the status that triggers failure alert evaluation.
- Keep `late` separate from `failed` so missed/late schedules can have separate rules.
- Use the same status labels across dashboard cards, history UI, alerts, and API responses.
- Do not require package-specific fields for the core result shape.

### Implementation handoff
- Code target: `/Users/ray/Work/crontinel/app`.
- First files likely to change: `routes/api.php`, `IngestController.php`, `CronRun.php`, `cron_runs` migration or additive migration, and feature tests for cron ingest/trigger behavior.
- Add tests for authenticated cron result storage, status validation, output/log storage, and `MonitorEvent` creation.
- If cloud-trigger execution requires credentials or infrastructure not available locally, mark that specific implementation dependency as a blocker and continue with history/retry planning.