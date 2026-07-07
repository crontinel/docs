# Task Sheet: Worker contract and progress sync

**Feature:** 2 — Worker contract and progress sync
**Stage:** 1 — Foundation, workspace, and baseline

## Files to inspect
- `docs/plans/mvp/master-plan.md`
- `docs/plans/mvp/progress.md`
- `docs/plans/mvp/implementation-tracker.md`
- `docs/plans/mvp/runtime/supervisor-t.json`
- `~/.hermes/cron/jobs.json`

## To do
- [x] Capture the always-on worker rules in the master plan and tracker.
- [x] Keep the health check, graceful restart, morning report, and no-idle behavior explicit.
- [x] Make sure the live runtime file mirrors the written contract.
- [x] Add stage, feature, and task counts to the progress tracker.
- [x] Record the latest plan split so the next turn can resume cleanly.
- [x] Leave the workspace in a state that a fresh worker can continue without asking for context again.

## Completion note
- 2026-06-06: Live cron jobs confirm Supervisor T every 15 minutes, health check every 15 minutes, graceful restart every 360 minutes, and morning blocker report at `0 10 * * *`. Progress, tracker, and runtime now point to the Feature 3 implementation handoff.

## Implementation steps
1. Re-read `docs/plans/mvp/master-plan.md`, `docs/plans/mvp/progress.md`, `docs/plans/mvp/implementation-tracker.md`, and `docs/plans/mvp/runtime/supervisor-t.json` before making any edits.
2. Check `~/.hermes/cron/jobs.json` to confirm the live schedules still match the written worker contract.
3. Compare the current worker rules against the runtime file and note any mismatch in cadence, restart timing, or morning-report behavior.
4. Update `progress.md` so the summary counts, current focus, and Stage 1 status reflect the latest plan split.
5. Add or refresh the tracker note that Stage 1 baseline verification is the next implementation step.
6. Re-read the runtime file after the update to confirm the stored worker state still matches the plan.
7. Leave a short log entry stating whether the worker contract, runtime file, and progress tracker are all aligned.

## Acceptance criteria
- The worker contract is written in the plan and tracker.
- The runtime state matches the plan.
- Progress clearly shows how much of the plan exists.
- The next implementation step is obvious from the tracker.
- A fresh worker can resume from the docs without extra explanation.
