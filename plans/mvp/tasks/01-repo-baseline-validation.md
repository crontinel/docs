# Task Sheet: Repo baseline validation

**Feature:** 1 — Repo baseline validation
**Stage:** 1 — Foundation, workspace, and baseline

## Files to inspect
- `app/routes/web.php`
- `app/resources/views/apps/index.blade.php`
- `app/resources/views/onboarding/index.blade.php`
- `app/resources/views/alerts/index.blade.php`
- `app/resources/views/status-pages/index.blade.php`
- `app/resources/views/team/billing.blade.php`

## To do
- [x] Verify the existing dashboard, billing, organization, API-key, alert endpoint, and package-connection surfaces.
- [x] Mark which parts are already baseline and which parts are still MVP gaps.
- [x] Confirm the repo root and any nested app boundaries that implementation must respect.
- [x] Note any repo-specific constraints that affect implementation order.
- [x] Turn the baseline audit into a concrete handoff for the next implementation task.

## Completion note
- 2026-06-06: Baseline findings are recorded in `docs/plans/mvp/baseline-audit.md`. Next product work should start in `/Users/ray/Work/crontinel/app` with Feature 3, using an isolated worktree/feature branch.

## Implementation steps
1. Start from the repo root and confirm the working directory matches the Crontinel workspace.
2. Inspect `app/routes/web.php` to list every route related to organization, billing, onboarding, apps, alerts, and status pages.
3. Open `app/resources/views/apps/index.blade.php` and `app/resources/views/onboarding/index.blade.php` to confirm the current app and onboarding surfaces.
4. Open `app/resources/views/alerts/index.blade.php`, `app/resources/views/status-pages/index.blade.php`, and `app/resources/views/team/billing.blade.php` to confirm what is already live.
5. Split the surfaces into two notes: baseline that already exists and MVP gap that still needs implementation.
6. Record any nested app boundary or repo caveat that would change where the next feature work should happen.
7. Write the baseline findings back into the planning docs so the next task can start from the same assumptions.

## Acceptance criteria
- Baseline surfaces are named explicitly in the plan.
- MVP gaps are separated from existing app coverage.
- The workspace points at the correct repo boundary.
- The plan tells implementers where to work first.
- The next task can start without re-discovering the same routes and views.
