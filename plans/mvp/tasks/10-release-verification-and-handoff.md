# Task Sheet: Release verification and handoff

**Feature:** 10 — Release verification and handoff
**Stage:** 4 — Package rollout and release

## Files to inspect
- `docs/plans/mvp/master-plan.md`
- `docs/plans/mvp/progress.md`
- `docs/plans/mvp/implementation-tracker.md`
- `docs/plans/mvp/runtime/supervisor-t.json`
- `~/.hermes/cron/jobs.json`

## To do
- [x] Enforce isolated worktree plus feature branch before implementation.
- [x] Keep Codex review first and Claude Code review second.
- [x] Keep the no-direct-commit-to-main rule explicit in the plan.
- [x] Define the live deployment verification step before marking work done.
- [x] Keep blockers and human-review escalations visible.
- [x] Make the handoff clear for the next worker or human reviewer.
- [x] Preserve the worker restart rules and the morning-report contract.

## Completion note
- 2026-06-06: Feature 10 implementation definition is recorded in `docs/plans/mvp/features/10-release-verification-and-handoff.md`, including branch/worktree workflow, review order, verification checklist, handoff format, and worker cadence.

## Implementation steps
1. Re-read the master plan, progress tracker, implementation tracker, and runtime state before doing any release work.
2. Check `~/.hermes/cron/jobs.json` to confirm the live worker cadence still matches the written contract.
3. Confirm that implementation work is expected to happen in a feature branch and isolated worktree rather than on main.
4. Record the review order as Codex first, then Claude Code, then live verification.
5. Define the release verification step as a real environment or browser check before anything is marked done.
6. Add a note that blockers and human-review items must be surfaced rather than hidden.
7. Keep the handoff text short enough that the next worker can resume without re-reading the whole plan.

## Acceptance criteria
- Every implementation task has a branch and review path.
- The review order is unambiguous.
- Live verification is part of the release checklist.
- Blockers are escalated instead of hidden.
- The handoff is clear for the next worker or human reviewer.
