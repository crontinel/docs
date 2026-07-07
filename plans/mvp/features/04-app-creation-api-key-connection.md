# Feature 4: App creation, API key generation, and connection setup

**Stage:** 2 — Dashboard-first onboarding

**Goal:** Turn the org overview into a concrete setup path that ends at package connection.

## Task group A: App and key flow
- Define the create-organization → create-app → generate-key flow.
- Make sure the app card and app page both surface API key generation.
- Keep the key-generation step obvious and in order.

**Acceptance criteria**
- A user can move from organization to app to API key without hunting.
- API key generation is visible in the right place.

## Task group B: Connection instructions
- Define the connection setup area on the app page.
- Include copy-paste snippets plus short explanatory steps.
- Keep the general tab first, then family-specific tabs.

**Acceptance criteria**
- Connection setup is understandable without extra support.
- The instructions support both quick copy and learning.

## Implementation definition

### Current baseline to reuse
- App creation exists in both dashboard app flow and onboarding app flow.
- `MonitoredApp::create()` auto-generates/stores an API key via model behavior; app detail and onboarding install already display the key.
- `apps.show` currently has Laravel-only app-detail connection copy.
- `onboarding.install` already has multi-family tab logic with Custom, PHP, Laravel, Node.js, Python, Ruby, Go, Rust, and .NET.
- API URL is inconsistent in inspected views: `apps.show` uses `https://app.crontinel.com`, while onboarding install uses `https://app.crontinel.com/api`. Feature implementation should standardize this before release.

### Required flow order
1. Create organization.
2. Create app.
3. Generate or reveal API key.
4. Connect package.
5. Test connection, then view app/dashboard activity.

### API key behavior
- Treat the key as app-scoped.
- App creation may continue to auto-create the first key, but the UI must present this as an explicit `Generate API key` or `Reveal API key` step so the MVP flow matches user expectations.
- App card quick action should include `Generate API key` before `Connect package`.
- App page should show key controls before alert setup and package instructions.
- Key copy UI should mask by default, support reveal, support copy, and avoid writing key values to docs/logs.

### Connection setup area
- On app page, create a dedicated `Connect package` section after API key controls.
- Tab order: General, Laravel, PHP, Node, Python, Other.
- General tab should explain the universal values: API key, API URL, and app identity.
- Family tabs should have copy-paste snippets plus 2-4 short explanatory steps.
- Laravel, Node, and Python need first-class copy because they are MVP priorities.
- `Other` can link to package repos/docs without adding unsupported claims.

### Copy decisions
- Section heading: `Connect this app`.
- Key step label: `Generate or reveal API key`.
- General tab intro: `Use these values from any Crontinel package or direct API integration.`
- Test CTA: `Test connection`.
- Success text: `Connected. Your first run will appear in history after the package reports a cron event.`

### Implementation handoff
- Code target: `/Users/ray/Work/crontinel/app`.
- First files likely to change: `resources/views/apps/show.blade.php`, `resources/views/apps/index.blade.php`, `resources/views/onboarding/install.blade.php`, and possibly `AppController.php` if explicit key regeneration is added.
- Reuse onboarding install tab data where practical, but make the app page default tab `General` rather than `Custom`.
- Do not implement retry/failure rules in this feature; that belongs to Features 5, 7, and 8.