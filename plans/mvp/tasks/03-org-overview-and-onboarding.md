# Task Sheet: Organization overview and onboarding guidance

**Feature:** 3 — Organization overview and onboarding guidance
**Stage:** 2 — Dashboard-first onboarding

## Files to inspect
- `app/routes/web.php`
- `app/resources/views/dashboard.blade.php`
- `app/resources/views/livewire/app-dashboard.blade.php`
- `app/resources/views/onboarding/index.blade.php`
- `app/resources/views/layouts/onboarding.blade.php`

## To do
- [x] Define the organization overview as the first landing view.
- [x] Include app count, org-wide recent activity, and an onboarding panel.
- [x] Keep the page dashboard-first rather than package-first.
- [x] Add the guided empty-state panel with a primary CTA.
- [x] Make create-app the first CTA when no app exists.
- [x] Keep the quick create path visible from the org overview.
- [x] Keep the copy short enough for first-time users.

## Completion note
- 2026-06-06: Feature 3 implementation definition is recorded in `docs/plans/mvp/features/03-org-overview-and-onboarding.md`, with overview blocks, CTA rules, copy, and app repo handoff.

## Implementation steps
1. Inspect the org and dashboard routes in `app/routes/web.php` to confirm where the landing view should live.
2. Review `app/resources/views/dashboard.blade.php` and `app/resources/views/livewire/app-dashboard.blade.php` to identify the existing dashboard patterns to reuse.
3. Review `app/resources/views/onboarding/index.blade.php` and `app/resources/views/layouts/onboarding.blade.php` to see how the first-run surface is framed today.
4. Define the organization overview content in the plan as three visible blocks: app count, recent activity, and onboarding guidance.
5. Decide the empty-state copy and primary CTA wording so new users see create-app first.
6. Record the quick-create placement and any fallback text needed when the organization has no apps yet.
7. Make sure the plan keeps onboarding first and package guidance second.

## Acceptance criteria
- New users land on the org overview.
- Recent activity is visible at the org level.
- The first-run path is obvious.
- The dashboard has a quick create app action.
- The onboarding copy does not make package setup the first thing users see.
