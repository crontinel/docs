---
title: Upgrading
description: How to upgrade between Crontinel versions, including breaking changes and config updates
---

## General upgrade steps

Every Crontinel upgrade follows the same sequence:

```bash
composer update crontinel/laravel
php artisan migrate
php artisan config:clear
php artisan cache:clear
php artisan crontinel:check
```

1. **Update the package** via Composer.
2. **Run migrations.** New releases may add or modify database tables. The package uses its own migration files, so this is safe to run alongside your app migrations.
3. **Clear config and cache.** This ensures Laravel picks up any new config defaults or service provider changes.
4. **Run the health check.** Confirms your database tables are current, the API key is valid (if configured), and monitors are responding.

### Config changes between versions

When a new version introduces config options, your existing `config/crontinel.php` won't include them automatically. You have two options:

1. Re-publish and compare:

```bash
php artisan vendor:publish --tag=crontinel-config
```

This will prompt before overwriting your file. Decline the overwrite, then diff the new defaults against your current config.

2. Check the version-specific notes below and add the new keys manually. This is faster when only a few options changed.

## v0.1.0 to v0.2.0

Released: April 8, 2026

### New features

- **SaaS reporting:** When `CRONTINEL_API_KEY` is set, the package automatically sends a status ping to `app.crontinel.com` every minute via the `crontinel:report` scheduled command. Individual cron run events are also pushed after each task completes or fails.
- **Webhook alert channel:** A new `webhook` alert channel sends structured JSON POST payloads (both fire and resolve events) to any URL you specify.
- **`crontinel:report` command:** Manually trigger a SaaS status ping at any time.
- **`crontinel:prune` command:** Delete old `cron_runs` records beyond the retention window. Accepts `--days=N` to override the configured value.

### Bug fixes

- **Cron late detection:** Fixed incorrect `isLate` calculation that used `Carbon::now()->next(closure)`. The check now uses `CronExpression::getPreviousRunDate()` to correctly determine whether a cron missed its scheduled window. If you previously saw false late alerts, this release resolves the issue.

### Breaking changes

None. This is a backward-compatible minor release.

### New config keys

Add the following to your `config/crontinel.php` if they are missing:

```php
// Inside the 'alerts' array, add the webhook channel:
'webhook' => [
    'url' => env('CRONTINEL_WEBHOOK_URL'),
],
```

### New environment variables

| Variable | Purpose |
|---|---|
| `CRONTINEL_API_KEY` | SaaS API key for status reporting to app.crontinel.com |
| `CRONTINEL_API_URL` | SaaS endpoint (defaults to `https://app.crontinel.com`) |
| `CRONTINEL_WEBHOOK_URL` | Webhook endpoint for the `webhook` alert channel |

To use the webhook channel, update your `.env`:

```env
CRONTINEL_ALERT_CHANNEL=webhook
CRONTINEL_WEBHOOK_URL=https://your-endpoint.example.com/webhook
```

### Migration

This release includes a migration. Run `php artisan migrate` after updating.

## v0.1.0 (initial release)

Released: April 5, 2026

This is the first stable release. No upgrade path needed; install from scratch using the [Quick Start](/quick-start/) guide.

### Requirements

- PHP 8.2, 8.3, 8.4, or 8.5
- Laravel 11, 12, or 13

### Included

- Horizon monitor (supervisor status, paused state, failed jobs per minute)
- Queue monitor (depth, failed count, oldest job age for Redis and database drivers)
- Cron monitor (automatic run recording via scheduler events)
- Dashboard at `/crontinel` with dark theme and 30-second auto-refresh
- `crontinel:check` CLI command with `--json` and `--no-alerts` flags
- `crontinel:install` CLI command
- Alert channels: Slack webhook and email, with 5-minute deduplication
- JSON API at `/crontinel/api/status`
