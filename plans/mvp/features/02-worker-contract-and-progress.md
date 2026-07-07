# Feature 2: Worker contract and progress sync

**Stage:** 1 — Foundation, workspace, and baseline

**Goal:** Keep the always-on planning worker and the progress files synchronized.

## Task group A: Worker contract lock
- Capture the always-on worker rules in the master plan and tracker.
- Keep the health check, graceful restart, morning report, and no-idle behavior explicit.
- Make sure the live runtime file mirrors the written contract.

**Acceptance criteria**
- The worker contract is written in the plan and tracker.
- The runtime state matches the plan.

## Task group B: Progress bookkeeping
- Add stage, feature, and task counts to the progress tracker.
- Record the latest plan split so the next turn can resume cleanly.
- Keep the progress file small but current.

**Acceptance criteria**
- Progress clearly shows how much of the plan exists.
- The next implementation step is obvious from the tracker.