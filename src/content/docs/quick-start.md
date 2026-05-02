---
title: Quick Start
description: Get Crontinel running in under 5 minutes
---

## 1. Install the package

```bash
composer require crontinel/laravel
```

## 2. Run the installer

```bash
php artisan crontinel:install
```

This publishes `config/crontinel.php` and runs the required database migrations.

## 3. Start the scheduler

Crontinel reads data from Laravel's scheduler. Add the scheduler cron entry to your server before opening the dashboard so data is ready when you first visit:

```bash
# Add to crontab (crontab -e) on your server
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

For local development, use the scheduler worker instead:

```bash
php artisan schedule:work
```

## 4. Open the dashboard

Visit `/crontinel` in your browser. You'll see the monitoring dashboard.

**What you should see on first open:**

| Section | Populated immediately? | Notes |
|---|---|---|
| **Queue** | ✅ Yes | Reads queue depth from Redis/DB immediately |
| **Horizon** | ✅ Yes (if installed) | Only appears when `laravel/horizon` is in your project |
| **Cron** | ⏳ After first run | Empty until the scheduler fires at least one cycle |

> **Cron section empty?** This is expected on a fresh install. Once your scheduler runs (either via `schedule:work` locally or the cron entry on your server), each registered command will appear after its first execution.

> **Horizon section missing?** Horizon monitoring only shows up when `laravel/horizon` is installed. If you don't use Horizon, this is expected — it won't appear, and everything else still works normally. Set `'horizon' => ['enabled' => false]` in `config/crontinel.php` to explicitly disable the panel.

## 5. (Optional) Configure alerts

In `.env`:

```env
CRONTINEL_ALERT_CHANNEL=slack  # Required environment variable
CRONTINEL_SLACK_WEBHOOK=https://hooks.slack.com/services/...  # Required environment variable
```

> **Not using Horizon?** Set `'horizon' => ['enabled' => false]` in `config/crontinel.php` to hide the Horizon panel.

## 6. (Optional) Connect to the SaaS

:::note
The Crontinel SaaS is now in early access. [Create a free account](https://crontinel.com/register) to get started.
:::

Once you have access, create a free account, create an app, and add your API key:

```env
CRONTINEL_API_KEY=your-api-key-here  # Required environment variable
CRONTINEL_API_URL=https://app.crontinel.com
```
