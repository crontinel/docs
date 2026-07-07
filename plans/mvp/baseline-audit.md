# Crontinel MVP Baseline Audit

**Last refreshed:** 2026-06-06T17:22:33+06:00
**Scope:** `/Users/ray/Work/crontinel/app` Laravel SaaS app, plus workspace repo boundaries.

## Repo boundaries
- Workspace root: `/Users/ray/Work/crontinel` is a grouping workspace with multiple nested repos and local operational files.
- Planning docs live in nested repo: `/Users/ray/Work/crontinel/docs` on branch `fix/docs-new-pages`; `docs/plans/` is currently untracked in that repo.
- App implementation repo: `/Users/ray/Work/crontinel/app`.
- Landing implementation repo: `/Users/ray/Work/crontinel/landing`.
- Future app changes should happen in an isolated worktree/feature branch from `/Users/ray/Work/crontinel/app`, not from the workspace root.

## Route baseline
From `app/routes/web.php` and `app/routes/api.php`:
- Authenticated dashboard: `GET /dashboard` via `DashboardController@index`.
- Onboarding: `/onboarding`, `/onboarding/app`, `/onboarding/install`, and `/onboarding/complete`.
- Apps: REST resource routes for `apps` except edit/update.
- Monitors: nested create/store/edit/update/delete under `/apps/{app}/monitors`.
- Organization/team: create, switch, settings, members, invite, removal, invitation cancel, plus backward-compatible `/team/*` aliases.
- Billing: organization billing index, change plan, checkout, upgrade, downgrade, cancel, resume, plus `/team/billing*` aliases.
- Alerts: `/alerts` index/store/delete/test.
- Status pages: public status routes and domain verification/remove routes. Status space remains out of MVP scope.
- API ingest: `POST /api/v1/ingest/ping`, `/cron`, `/event` with API-key middleware.
- API read surfaces: apps, app status, cron runs, active alerts, and test route under `/api/v1` with API-key middleware.
- Stripe webhook route exists at `POST /api/webhooks/stripe`.

## Existing baseline surfaces
- Dashboard exists and shows organization name, upgrade CTA, empty app state, app cards, latest ping status, last ping time, queue count, and cron runs today.
- App creation exists with name/timezone and plan-limit enforcement.
- App list exists with API key preview, last ping, status, view/delete actions, and empty state.
- App detail exists with full API key display, copy actions, API URL, Laravel `.env` snippet, Laravel package install instructions, monitors list, and Livewire app dashboard.
- Onboarding exists for organization naming, app creation, install instructions, and completion.
- Organization/team routes exist for owner-managed settings, invitations, and member removal.
- Billing page exists with current plan, plan change, cancellation/resume, resubscribe, invoice history, and Stripe-managed subscription flows.
- Alert channel management exists for Slack, email, and webhook channels, including plan gating, add/list/delete/test flows, and organization-wide default scope.
- API-key authenticated ingest exists for ping, cron run records, and generic events.
- Basic execution history exists in data/API form through `CronRun` creation and `/api/v1/apps/{slug}/cron-runs`.

## MVP gaps
- Organization overview needs the specified onboarding guidance: app count, org-wide recent activity, quick create app CTA, and guided empty-state checklist.
- App dashboard cards need MVP quick-action set and order: view details, generate API key, connect package, alert settings.
- API key generation/rotation is not visible as a first-class dashboard action; current app creation creates a key and app detail displays it.
- App page package connection needs dashboard-first structure with generic default tab plus Laravel, PHP, Node, Python, and other tabs. Current copy is Laravel-only.
- Alert setup needs MVP retry and failure-rule configuration under a visible collapsed add-ons tab with minimal defaults.
- Alert channels are organization-wide by default in create flow; per-app alert setup needs clearer dashboard/app integration.
- Team roles/permissions need owner/admin/member/viewer hierarchy and permission-list-based role builder. Current protected routes appear owner-focused.
- Execution history UI needs explicit one-line title plus full log; current cron output is stored but no dedicated MVP history UI was confirmed in inspected views.
- Retry behavior for failed cron jobs is not represented in the inspected dashboard/alert configuration surfaces.
- Cloud cron trigger execution itself is not yet represented as a completed MVP surface in inspected routes/views.
- Recent activity feed for app creations, API key events, cron run results, and alert events is not present in the inspected dashboard.

## Implementation handoff
- First app implementation area: `/Users/ray/Work/crontinel/app`.
- Recommended next product task: Feature 3, organization overview and onboarding guidance, because it connects existing dashboard/app/onboarding surfaces and does not depend on core cron trigger internals.
- Keep status pages out of MVP feature work unless a dependency appears, because the master plan marks status space as out of scope.
- Use feature branch/worktree workflow for any app repo changes and avoid direct commits to `main`.
