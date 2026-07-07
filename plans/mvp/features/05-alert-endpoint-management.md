# Feature 5: Alert endpoint management and alert configuration

**Stage:** 2 — Dashboard-first onboarding

**Goal:** Make alert setup part of the dashboard flow, not a separate afterthought.

## Task group A: Endpoint management
- Define alert endpoint management in the dashboard surface.
- Support the email and webhook destination types already in scope.
- Keep endpoint config close to the app and org context.

**Acceptance criteria**
- Users can find and manage alert endpoints from the dashboard path.
- The alert destination types remain explicit.

## Task group B: Alert configuration menu
- Define the dashboard alert configuration menu.
- Include retry and failure rules under a visible but collapsed add-ons tab.
- Keep the default config simple and reconfigurable.

**Acceptance criteria**
- Alert configuration is visible without overwhelming first-time users.
- Retry and failure settings are editable when needed.

## Implementation definition

### Current baseline to reuse
- Alert routes already exist at `/alerts` for list, create, delete, and test.
- `AlertChannel` stores `team_id`, optional `app_id`, `type`, `config`, `is_enabled`, and `last_tested_at`.
- Controller/test coverage supports Slack, email, and webhook, with plan gating and test dispatch.
- MVP scope from the master plan requires email and webhook endpoints. Slack can remain if already available, but email and webhook must be explicit in the dashboard flow.
- Current create flow defaults to organization-wide channels (`app_id = null`), while tests also cover app-scoped channels.

### Dashboard placement
- Organization dashboard should show a compact `Alert endpoints` card with configured count, last tested status, and CTA: `Manage alerts`.
- App cards should include quick action `Alert settings` after `Connect package`.
- App detail should show an `Alert settings` section after API key and connection setup.
- The existing `/alerts` page can remain the full management surface, but the app/dashboard path must link to it clearly and preserve app context when possible.

### Destination types
- First-class MVP destinations: Email and Webhook.
- Keep Slack only as an existing optional channel if implementation already supports it; do not make Slack required for MVP acceptance.
- Email config: recipient email.
- Webhook config: target URL and test action.
- All destination forms should show scope: organization-wide or selected app.

### Alert configuration menu
- Default section should be minimal:
  - Destination type.
  - Destination value.
  - Scope.
  - Enabled toggle.
  - Test alert action.
- Add-ons tab should be visible by default but collapsed.
- Add-ons tab label: `Add-ons: retry and failure rules`.
- Default retry config copy: `Use Crontinel defaults unless this app needs custom timing.`
- Default failure-rule copy: `Alert when a cron run fails or misses its expected window.`
- Retry timing and failure rules must be editable, but detailed retry execution belongs to Features 7 and 8.

### Edit path
- After creating an endpoint, the configured endpoint list should show `Edit`, `Test`, and `Delete` actions.
- If edit is not yet implemented, Feature 5 implementation must add it or record an explicit blocker before moving on.
- Testing should update `last_tested_at` and show a friendly result.

### Implementation handoff
- Code target: `/Users/ray/Work/crontinel/app`.
- First files likely to change: `AlertChannelController.php`, `AlertChannel.php`, `resources/views/alerts/index.blade.php`, `resources/views/apps/show.blade.php`, and alert feature tests.
- Add/update tests for email and webhook destination visibility, app scope, collapsed add-ons defaults, edit action, and plan-gated behavior.
- Avoid changing core retry execution semantics in this feature; only expose the configuration shape needed for later features.