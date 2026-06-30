---
title: Installation
description: Full installation and configuration guide for Laravel
---

import { Aside } from '@astrojs/starlight/components';

## Quickstart

Get from zero to your first cron data in under 3 minutes.

### 1. Prerequisites

- PHP 8.2+
- Laravel 11, 12, or 13
- A Crontinel account ([sign up free](https://app.crontinel.com/register))

### 2. Install

```bash
composer require crontinel/laravel
php artisan crontinel:install
php artisan migrate
```

### 3. Configure

By default the dashboard is at `/crontinel`. Optionally change it in your `.env`:

```env
CRONTINEL_PATH=crontinel
```

### 4. Open the dashboard

Visit `/crontinel` in your browser. You'll see the monitoring dashboard.

> **What you should see:** The Horizon and Queue sections populate immediately. The Cron section will be empty until your scheduler has run at least once — this is normal.

### 5. Run your scheduler

For local development:

```bash
php artisan schedule:work
```

For production, add this to your server's crontab:

```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

### 6. Dashboard verification

After the first scheduler tick:

1. Go to `/crontinel` in your browser
2. The **Cron** section now shows your registered scheduled commands
3. Each command displays its last run time, exit code, and duration

<Aside>
The Laravel package works fully offline with no external API key required. To send data to the Crontinel SaaS, add `CRONTINEL_API_KEY` to your `.env`.
</Aside>

---

## Requirements

- PHP 8.2, 8.3, 8.4, or 8.5
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
