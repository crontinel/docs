# Feature 3: Organization overview and onboarding guidance

**Stage:** 2 — Dashboard-first onboarding

**Goal:** Make the first landing view the org dashboard with helpful guidance.

## Task group A: Landing layout and activity
- Define the organization overview as the first landing view.
- Include app count, org-wide recent activity, and an onboarding panel.
- Keep the page dashboard-first rather than package-first.

**Acceptance criteria**
- New users land on the org overview.
- Recent activity is visible at the org level.

## Task group B: Empty-state CTA and quick create
- Add the guided empty-state panel with a primary CTA.
- Make create-app the first CTA when no app exists.
- Keep the quick create path visible from the org overview.

**Acceptance criteria**
- The first-run path is obvious.
- The dashboard has a quick create app action.

## Implementation definition

### Current baseline to reuse
- `GET /dashboard` already resolves to `DashboardController@index` and is the authenticated team landing route.
- `dashboard.blade.php` already has an organization header, app empty state, app cards, upgrade CTA, and `+ Add app` action when apps exist.
- `OnboardingController` currently sends first-run users through organization naming, app creation, install, and completion before dashboard.
- `livewire/app-dashboard.blade.php` already has package guidance and cron-run tables at the app detail level, so the organization overview should not duplicate detailed package setup.

### Required organization overview blocks
1. **Overview stats row**
   - App count.
   - Cron runs today, across all organization apps.
   - Latest run status or latest activity status, across all organization apps.
2. **Onboarding guidance panel**
   - Visible on first land and whenever the organization has not completed the core checklist.
   - Checklist: create organization, create app, generate API key.
   - Primary CTA rules:
     - No app exists: `Create app`.
     - App exists but no key/action surfaced yet: `Generate API key` or app configuration CTA from Feature 4.
     - App and key exist: `Connect package`.
   - Keep package copy secondary and short.
3. **Org-wide recent activity**
   - Show latest app creations, API key events, cron run results, and alert events when data exists.
   - Use friendly empty text when no activity exists: `Activity will appear here after you create an app or receive your first run.`
4. **Apps section**
   - Keep both an app list/grid and summary card pattern.
   - Each app card should reserve room for latest run status, last run time, and quick actions in Feature 4.

### Copy decisions
- Empty-state title: `Set up your first monitored app`.
- Empty-state body: `Create an app first. Crontinel will give you an API key and package instructions after that.`
- Primary CTA with no apps: `Create app`.
- Secondary link: `View connection guide`, only after app creation.

### Implementation handoff
- Code target: `/Users/ray/Work/crontinel/app`.
- First files likely to change: `DashboardController.php`, `resources/views/dashboard.blade.php`, and possibly a small view partial for onboarding guidance/recent activity.
- Avoid changing app-detail package instructions in this feature unless needed to keep the dashboard CTA coherent; full package tabs belong to Feature 4.
- Do not reintroduce status pages into the MVP dashboard path.