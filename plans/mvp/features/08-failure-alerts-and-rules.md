# Feature 8: Failure alerts and rules

**Stage:** 3 — Core cron experience

**Goal:** Make failure notifications part of the MVP core behavior.

## Task group A: Alert dispatch rules
- Define when a failed cron job should emit an alert.
- Keep email and webhook delivery paths in scope.
- Make the failure rules match the user-selected config.

**Acceptance criteria**
- The plan explains when alerts fire.
- The delivery paths are consistent with the dashboard config.

## Task group B: User-facing failure copy
- Define how failures are described in the UI and logs.
- Keep the copy actionable, not vague.
- Make blocker/human-review cases distinct from routine failure alerts.

**Acceptance criteria**
- Failure messages are understandable.
- Human-review cases are distinguishable from system failures.

## Implementation definition

### Current baseline to reuse
- `AlertEvaluator` currently evaluates Horizon and queue conditions from ping payloads, not cron-run failures.
- `SendAlert` already supports email and webhook delivery. Slack and PagerDuty exist, but email/webhook are MVP priorities.
- Active alerts are deduped by `alert_key` and re-fired after a 5-minute cooldown.
- Email copy uses `[Alert]` / `[Resolved]` subjects and a dashboard CTA.
- Webhook payload currently includes app, alert key, message, state, and fired timestamp.

### When alerts fire
- Failure alert rule: when a `CronRun` result is stored with status `failed`, evaluate the app/org failure rules and dispatch to enabled matching channels.
- Late/missed rule: when a run is stored as `late` or when missed schedule detection classifies a run as missed, dispatch only if that rule is enabled.
- Do not alert for `running` unless a separate timeout/missed-window rule marks it as late.
- Do not alert for `completed` except to resolve an existing active alert when the same job recovers.
- Respect channel scope: app-specific channels plus organization-wide channels.

### Delivery paths
- Email: send subject with app name, cron title, and status.
- Webhook: send structured JSON with app, command/title, status, run ID, alert key, message, state, fired_at, and dashboard URL if available.
- Existing Slack/PagerDuty paths can remain covered by current tests, but MVP acceptance should be based on email and webhook.

### Failure rules
- Minimum rule fields:
  - Alert on failed runs.
  - Alert on late/missed runs.
  - Cooldown/re-fire interval.
  - Notify on recovery/resolution.
- Rules should use the defaults surfaced in Feature 5 add-ons and stay editable later.
- Alert keys should be stable and specific, for example `cron:{app_id}:{command_hash}:failed` or equivalent, without exposing secrets.

### User-facing copy
- Alert title pattern: `Cron failed: {job title}`.
- Short body: `{app name} reported {job title} as failed with exit code {exit_code}.`.
- Include next action: `View the full log in Crontinel.`
- Include timing: started/finished/duration when available.
- For late/missed: `Cron late: {job title}` and explain expected vs observed timing when known.

### Blocker/human-review separation
- Routine cron failures are product alerts to the user's configured destinations.
- Planning blockers and human-review items belong only in supervisor/morning reports and must not be mixed with customer alert language.
- If implementation lacks enough infrastructure to trigger/retry a job, record that as a planning blocker, not as an app failure alert.

### Implementation handoff
- Code target: `/Users/ray/Work/crontinel/app`.
- First files likely to change: `AlertEvaluator.php`, `SendAlert.php`, `AlertNotificationMail.php`, email template, cron ingest flow, and feature tests.
- Add tests for failed cron dispatch, late/missed dispatch, no alert on completed runs, scoped channels, webhook payload fields, and email subject/body copy.