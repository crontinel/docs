# Task Sheet: Failure alerts and rules

**Feature:** 8 — Failure alerts and rules
**Stage:** 3 — Core cron experience

## Files to inspect
- `app/app/Services/AlertEvaluator.php`
- `app/app/Jobs/SendAlert.php`
- `app/app/Mail/AlertNotificationMail.php`
- `app/tests/Feature/AlertEvaluatorTest.php`
- `app/tests/Feature/SendAlertJobTest.php`
- `app/resources/views/emails/alert-notification.blade.php`

## To do
- [x] Define when a failed cron job should emit an alert.
- [x] Keep email and webhook delivery paths in scope.
- [x] Make the failure rules match the user-selected config.
- [x] Define how failures are described in the UI and logs.
- [x] Keep the copy actionable, not vague.
- [x] Make blocker/human-review cases distinct from routine failure alerts.
- [x] Keep the alert text consistent with the alert settings.

## Completion note
- 2026-06-06: Feature 8 implementation definition is recorded in `docs/plans/mvp/features/08-failure-alerts-and-rules.md`, including cron-failure dispatch rules, email/webhook payload shape, failure copy, and separation from planning blockers.

## Implementation steps
1. Inspect `app/app/Services/AlertEvaluator.php` to understand how failure conditions are turned into alert decisions.
2. Inspect `app/app/Jobs/SendAlert.php` and `app/app/Mail/AlertNotificationMail.php` to understand delivery and message shape.
3. Review `app/tests/Feature/AlertEvaluatorTest.php` and `app/tests/Feature/SendAlertJobTest.php` to reuse existing terminology and edge cases.
4. Review `app/resources/views/emails/alert-notification.blade.php` to see how failure details are currently rendered.
5. Define the failure rule as a clear when/then statement: when a run fails in the selected way, send the configured alert.
6. Separate ordinary failure alerts from blocker or human-review cases so the plan does not blur them together.
7. Record the minimum alert copy needed to make the failure actionable in email or webhook form.

## Acceptance criteria
- The plan explains when alerts fire.
- The delivery paths are consistent with the dashboard config.
- Failure messages are understandable.
- Human-review cases are distinguishable from system failures.
- The alert rules match the selected configuration.
