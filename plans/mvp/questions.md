# Crontinel MVP Intake Log

## Rules
- One question at a time.
- After each answer, update the plan before asking the next question.
- Keep answers short and specific when possible.

## Questions asked
- Q1: What is the one-sentence goal of the MVP?
- Q2: Who is the primary target user for the MVP?
- Q3: What is the core problem the MVP solves?
- Q4: What are the must-have features for the MVP?
- Q5: What should be out of scope for the MVP?
- Q6: What does success look like for the MVP?
- Q7: Should the MVP include failure alerts?
- Q8: Should the MVP include job execution history?
- Q9: For history, do you want a basic run log or a full run timeline with details?
- Q10: Should the MVP include retry behavior for failed cron jobs?
- Q11: Which package should be updated first to support Crontinel?
- Q12: Which package families are most important for MVP?
- Q13: What should the app/dashboard include besides billing?
- Q14: Should the dashboard also include alert endpoint management for the MVP?
- Q15: Should the MVP support single-user accounts only, or also shared team/org access for API keys and alert endpoints?
- Q16: Should invited members have manage access to API keys and alert endpoints, or view-only?
- Q17: Should MVP use only the existing owner/member roles, or add finer-grained permissions now?
- Q18: Should the MVP include a viewer role?
- Q19: Should the MVP include a permission list that can generate custom roles from default role presets?
- Q20: Should role creation/editing be owner-only or allowed for admins too?
- Q21: Should the MVP onboarding flow be dashboard-first or package-first?
- Q22: Should the dashboard auto-create the first app after organization creation, or require an explicit create-app step?
- Q23: Should the first landing view be the organization overview with onboarding guidance, or a dedicated onboarding checklist page?
- Q24: Should the organization overview include a quick create app button?
- Q25: How should the supervisor and worker loop behave?

## Answers
- User said the MVP is a job monitoring platform derived from Chrome Sentinel, focused first on cloud Chrome/cron jobs that people can trigger from Crontinel services.
- User said the target users are AI models, AI tool users, online-service users, offline-service users who need a constant reminder, and cloud agents/services that need cron jobs triggered from the cloud.
- User said the core problem is triggering cron jobs from the cloud to either a local host server or a remote web endpoint, but that remote/local web-triggering is a later-stage concern, not MVP scope.
- User said the must-have feature is triggering a cron job because that is the essence of Crontinel.
- User said status space is probably out of scope for the MVP and should come later.
- User said success means cloud cron jobs run successfully and the different packages can connect to cloud cron jobs and to local machines, startups, and web workloads.
- User said the MVP should include configurable failure alerts via email or webhook endpoints.
- User said the MVP should include some level of history.
- User said the history should include a basic one-line title and a full log.
- User said retry behavior for failed cron jobs is a core functionality.
- User said there are multiple cron packages already, and they all need to be updated to work with Crontinel.
- User said Laravel, Node, and Python are the most important package families, and all packages matter because users will use Crontinel through the packages.
- User said the app already has a basic dashboard and billing subscription flow, and the dashboard area should support generating API keys, endpoints, and connection setup.
- User said the dashboard should also include alert endpoint management for the MVP.
- User said the MVP should support shared team/organization access for API keys and alert endpoints.
- User said team access should support an owner plus invited members.
- User said access should be controlled by organization role and permission.
- User said viewers are read-only.
- User said the MVP should include a permission list that can generate custom roles from default role presets.
- User said the role hierarchy should be owner/admin/member/viewer, with the owner as the ultimate admin.
- User said the onboarding flow should be dashboard-first.
- User said the sequence is: create organization, create app, generate API key, then connect the package.
- User said the first landing view should be the organization overview, with app count and onboarding guidance visible.
- User said the organization overview should show app count, recent activity, and quick create button.
- User said the main dashboard should show onboarding guidance on first land.
- User said recent activity should show app creations, API key events, cron run results, and alert events.
- User said onboarding should use a guided empty-state panel with one primary CTA on first land.
- User said the primary CTA should be create app when no app exists, and generate API key when an app already exists but no key exists, with create app always first.
- User said the dashboard will have an alert configuration menu.
- User said the dashboard alert configuration menu should cover both email alerts and web alerts.
- User said alert setup should include destination config plus retry and failure rules.
- User said retry and failure rules live under a collapsed add-ons tab with a default config and reconfigurable options.
- User said the add-ons tab should be visible by default but collapsed.
- User said the add-ons tab default config should be simple and minimal.
- User said the add-ons tab should let users edit both retry timing and failure rules.
- User said the dashboard recent activity should be org-wide across all apps.
- User said the dashboard app section should show both a list of all apps and summary cards for each app.
- User said each app card should show latest run status plus quick actions.
- User said the app card quick actions should be view details plus all three app actions.
- User said the empty state should use a create app CTA plus a short checklist.
- User said the short checklist should be create organization, create app, generate API key.
- User said package connection instructions should be both generic and family-specific.
- User said package connection guidance should use tabs with a family-specific default.
- User said the package connection tab default should be a general view first, with tabs for Laravel, PHP, Node, Python, and other repos.
- User said the package connection instructions should include both copy-paste snippets and short explanatory steps.
- User said the dashboard app cards should show status plus last run time.
- User confirmed the app card quick action order is fine as view details, generate API key, connect package, then alert settings.
- User said separate cards are better than a single checklist because they track feature completion better.
- User said the app page layout is not strict and can be adjusted later.
- User said the worker/supervisor loop should stay always-on, run 24/7, re-read the latest files, pick the next viable task immediately after done/review/blocked, and report blockers plus the human-review list in the morning.

## Clarification needed
- Confirmed: "Chrome jobs" means cron jobs.

## Clarification needed
- Confirmed: "Chrome jobs" means cron jobs.
