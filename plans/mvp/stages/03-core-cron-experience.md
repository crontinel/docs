# Stage 3: Core cron experience

**Goal:** Make the actual cron-job lifecycle reliable and visible.

**Focus:** Trigger execution, history, retries, and failure handling.

## Features
- Feature 6: Cron trigger execution (`../features/06-cron-trigger-execution.md`)
- Feature 7: Execution history and retries (`../features/07-history-and-retries.md`)
- Feature 8: Failure alerts and rules (`../features/08-failure-alerts-and-rules.md`)

## Exit criteria
- Users can trigger a cron job and see what happened.
- Failures surface with actionable history and retry behavior.
- Alerts and failure rules are part of the core product, not an afterthought.