---
title: Installation
description: Full installation and configuration guide
---

## Requirements

- PHP 8.2, 8.3, or 8.4
- Laravel 11, 12, or 13

## Install

```bash
composer require crontinel/laravel
php artisan crontinel:install
php artisan migrate
```

After running the installer, `config/crontinel.php` is published to your project. Review it to set the dashboard path, middleware, and alert thresholds. See the [configuration reference](/reference/configuration) for all available options.

> **Using Horizon?** Set `'horizon' => ['enabled' => true]` in `config/crontinel.php`. If you're not using Horizon, set it to `false` to hide the Horizon panel.

## Requirements check

Run the health check to confirm everything is wired up correctly:

```bash
php artisan crontinel:check
```

## Dashboard path

By default the dashboard is at `/crontinel`. To change it:

```env
CRONTINEL_PATH=monitoring  # Required environment variable
```

## Middleware

The dashboard uses `['web', 'auth']` middleware by default. To customize:

```php
// config/crontinel.php
'middleware' => ['web', 'auth', 'can:view-monitoring'],
```

## Requirements check

```bash
php artisan crontinel:check
```

Exits 0 if healthy, 1 if any alert is active. Use in CI pipelines:

```bash
php artisan crontinel:check --format=json
```

## Environment variables

All Crontinel environment variables and their defaults. Set these in `.env` or directly in `config/crontinel.php`:

```env
# Dashboard path (default: /crontinel)
CRONTINEL_PATH=crontinel

# Horizon integration (set to false if you don't use Horizon)
CRONTINEL_HORIZON_ENABLED=true
CRONTINEL_HORIZON_CONNECTION=horizon

# Alert channel (slack, email, webhook, pagerduty)
CRONTINEL_ALERT_CHANNEL=slack
CRONTINEL_SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
CRONTINEL_ALERT_EMAIL=alerts@example.com
CRONTINEL_WEBHOOK_URL=https://your-endpoint.example.com/crontinel
CRONTINEL_PAGERDUTY_ROUTING_KEY=

# SaaS reporting (optional — omit for local-only monitoring)
CRONTINEL_API_KEY=
CRONTINEL_API_URL=https://app.crontinel.com
```

See the [configuration reference](/reference/configuration) for all options including thresholds, retention, and middleware.

## Upgrading

Pull the latest version through Composer:

```bash
composer update crontinel/laravel
```

If you want to pin a specific version, use `composer require crontinel/laravel:^2.0` instead.

### Run new migrations

New releases sometimes add or modify tables. After updating, always run:

```bash
php artisan migrate
```

The package uses its own migration files, so this is safe to run alongside your app migrations. Check the release notes if you're curious what changed.

### Config changes

If a new version introduces config options, your existing `config/crontinel.php` won't have them. You've got two choices:

1. Re-publish and diff manually:

```bash
php artisan vendor:publish --tag=crontinel-config
```

This will ask to overwrite your existing file. Say no, then compare the new defaults with your current config.

2. Check the changelog for new keys and add them yourself. This is usually faster if only one or two options were added.

### Check for breaking changes

Before upgrading across major versions, read the [changelog](https://github.com/crontinel/laravel/blob/main/CHANGELOG.md). Major releases may rename config keys, drop support for older Laravel/PHP versions, or change method signatures. In practice, minor and patch releases won't break anything.

### Verify the upgrade

Once you've migrated and updated your config, run the health check:

```bash
php artisan crontinel:check
```

This confirms your database tables are current, the API key is valid, and the agent can reach the Crontinel servers. If something's off, it'll tell you exactly what failed.

So, the full upgrade sequence looks like this:

```bash
composer update crontinel/laravel
php artisan migrate
php artisan crontinel:check
```

Three commands, done in under a minute.
