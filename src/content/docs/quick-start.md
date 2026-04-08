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

## 3. Open the dashboard

Visit `/crontinel` in your browser. You'll see the monitoring dashboard.

> **What you should see:** The Horizon and Queue sections populate immediately. The Cron section will be empty until your scheduler has run at least once — this is normal. After the first scheduler tick (or after running `schedule:work` locally), your registered commands will appear.

## 4. Run your scheduler

Crontinel reads data from Laravel's scheduler. For the cron section to populate, your scheduler must be running:

```bash
# On your server: add this to crontab (crontab -e)
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

For local development, use the scheduler worker instead:

```bash
php artisan schedule:work
```

## 5. (Optional) Configure alerts

In `.env`:

```env
CRONTINEL_ALERT_CHANNEL=slack
CRONTINEL_SLACK_WEBHOOK=https://hooks.slack.com/services/...
```

> **Not using Horizon?** Set `'horizon' => ['enabled' => false]` in `config/crontinel.php` to hide the Horizon panel.

## 6. (Optional) Connect to the SaaS

:::note
The Crontinel SaaS (app.crontinel.com) is currently in early access. [Join the waitlist](https://crontinel.com/#waitlist) to get notified when it launches.
:::

Once you have access, create a free account, create an app, and add your API key:

```env
CRONTINEL_API_KEY=your-api-key-here
```
