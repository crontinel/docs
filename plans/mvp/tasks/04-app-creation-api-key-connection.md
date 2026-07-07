# Task Sheet: App creation, API key generation, and connection setup

**Feature:** 4 — App creation, API key generation, and connection setup
**Stage:** 2 — Dashboard-first onboarding

## Files to inspect
- `app/routes/web.php`
- `app/resources/views/apps/index.blade.php`
- `app/resources/views/apps/show.blade.php`
- `app/resources/views/onboarding/app.blade.php`
- `app/resources/views/onboarding/install.blade.php`

## To do
- [x] Define the create-organization → create-app → generate-key flow.
- [x] Make sure the app card and app page both surface API key generation.
- [x] Keep the key-generation step obvious and in order.
- [x] Define the connection setup area on the app page.
- [x] Include copy-paste snippets plus short explanatory steps.
- [x] Keep the general tab first, then family-specific tabs.
- [x] Keep the app page copy aligned with the onboarding flow.

## Completion note
- 2026-06-06: Feature 4 implementation definition is recorded in `docs/plans/mvp/features/04-app-creation-api-key-connection.md`, including key behavior, tab order, copy, and app repo handoff. It also flags the API URL inconsistency between app detail and onboarding install.

## Implementation steps
1. Inspect `app/routes/web.php` to confirm the app list, app detail, and onboarding routes that the flow can use.
2. Review `app/resources/views/apps/index.blade.php` and `app/resources/views/apps/show.blade.php` to see where app cards, API key actions, and connection instructions belong.
3. Review `app/resources/views/onboarding/app.blade.php` and `app/resources/views/onboarding/install.blade.php` to keep the onboarding steps in the same order as the dashboard flow.
4. Define the app-creation sequence as organization first, then app creation, then API key generation, then package connection.
5. Add notes for the app card so API key generation is visible before users open the full app page.
6. Specify the connection setup area as a general tab first, followed by family-specific tabs with copy-paste snippets.
7. Capture the short explanatory copy needed for users who want both quick copy and a minimal walkthrough.

## Acceptance criteria
- A user can move from organization to app to API key without hunting.
- API key generation is visible in the right place.
- Connection setup is understandable without extra support.
- The instructions support both quick copy and learning.
- The plan preserves the dashboard-first flow order.
