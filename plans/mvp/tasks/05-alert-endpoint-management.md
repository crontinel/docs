# Task Sheet: Alert endpoint management and alert configuration

**Feature:** 5 — Alert endpoint management and alert configuration
**Stage:** 2 — Dashboard-first onboarding

## Files to inspect
- `app/routes/api.php`
- `app/app/Models/AlertChannel.php`
- `app/app/Http/Controllers/AlertChannelController.php`
- `app/tests/Feature/AlertChannelControllerTest.php`
- `app/resources/views/livewire/app-dashboard.blade.php`
- `app/resources/views/apps/show.blade.php`

## To do
- [x] Define alert endpoint management in the dashboard surface.
- [x] Support the email and webhook destination types already in scope.
- [x] Keep endpoint config close to the app and org context.
- [x] Define the dashboard alert configuration menu.
- [x] Include retry and failure rules under a visible but collapsed add-ons tab.
- [x] Keep the default config simple and reconfigurable.
- [x] Make the edit path obvious after an alert endpoint is created.

## Completion note
- 2026-06-06: Feature 5 implementation definition is recorded in `docs/plans/mvp/features/05-alert-endpoint-management.md`, including dashboard placement, MVP destination types, add-ons behavior, edit path, and test handoff.

## Implementation steps
1. Inspect `app/app/Models/AlertChannel.php` and `app/app/Http/Controllers/AlertChannelController.php` to confirm how alert endpoints are represented and edited today.
2. Inspect `app/tests/Feature/AlertChannelControllerTest.php` to see the expected controller behavior and to reuse its vocabulary in the plan.
3. Review `app/resources/views/livewire/app-dashboard.blade.php` and `app/resources/views/apps/show.blade.php` to find the best place for endpoint management and alert configuration actions.
4. Check `app/routes/api.php` to confirm whether alert creation or update actions need API coverage in the MVP flow.
5. Define the dashboard alert menu as a simple default section plus a collapsed add-ons section for retry and failure rules.
6. Record the email and webhook types as the only destination types the MVP needs to explain.
7. Add a note that endpoint settings must stay tied to the current app and organization context, not live in a separate hidden screen.

## Acceptance criteria
- Users can find and manage alert endpoints from the dashboard path.
- The alert destination types remain explicit.
- Alert configuration is visible without overwhelming first-time users.
- Retry and failure settings are editable when needed.
- The edit path is obvious after an endpoint is created.
