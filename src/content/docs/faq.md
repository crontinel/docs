---
title: FAQ
description: Frequently asked questions about Crontinel
---

## General

### What is Crontinel?

Crontinel monitors your Laravel application's cron jobs, scheduled tasks, and background queues. Where generic uptime tools only check if a server is reachable, Crontinel watches what those tools miss — failed cron runs, late executions, queue bottlenecks, and dead Horizon supervisors.

### What does Crontinel monitor?

- **Cron/scheduler**: Every `schedule:run` execution is recorded with exit code, duration, and output
- **Laravel Horizon**: Per-supervisor status, failed job rates, queue depth
- **Queue workers**: Job backlogs, wait times, failed job counts
- **Custom health**: Define your own `/up` endpoint and alert on its conditions

### What is the difference between Crontinel and generic uptime monitoring?

Generic tools (Pingdom, UptimeRobot) check if a URL or port responds. They can't tell you that your hourly invoice cron failed silently, or that your `emails` queue is 3,000 jobs deep. Crontinel integrates directly with Laravel to surface the failures that matter.

---

## Plans and Billing

### Is there a free plan?

Yes. The free plan includes:
- 1 app
- 5 monitors
- 7-day history
- Email + Slack alerts

### What does Pro include?

Pro ($8/month) adds:
- Unlimited apps and monitors
- 30-day history
- Custom branding for status pages
- Priority support
- Webhook and PagerDuty alerts

### What happens if Crontinel SaaS goes down?

Your Laravel app keeps running — Crontinel only sends alerts. If the SaaS is unreachable, you'll miss notifications until it recovers, but your local dashboard continues to work.

For self-hosted users, no SaaS dependency at all.

---

## Installation

### Do I need Horizon to use Crontinel?

No. Horizon is optional. If you're not using Horizon, set `'horizon' => ['enabled' => false]` in `config/crontinel.php` and the Horizon panel will be hidden.

### Does Crontinel work with Octane?

Yes. Crontinel hooks into Laravel's scheduler and queue events, which are Octane-compatible. The only requirement is that your scheduler still fires `schedule:run` via cron.

### How do I upgrade Crontinel?

```bash
composer update crontinel/laravel
php artisan migrate
php artisan vendor:publish --tag=crontinel-config --force
```

Review the [changelog](https://github.com/crontinel/laravel/blob/main/CHANGELOG.md) for breaking changes between versions.

---

## Data and Privacy

### What data does Crontinel SaaS send?

When using the hosted SaaS, your app sends:
- Cron run records (command name, exit code, duration, timestamps)
- Queue metrics (depth, wait time, failed count)
- Horizon metrics (supervisor status, failed job rate)

No user data, passwords, or business logic is transmitted. All data is encrypted in transit and at rest.

---

## Troubleshooting

### The Cron section is empty

The scheduler must run at least once before cron entries appear. Run `php artisan schedule:work` locally, or ensure your server cron is executing `schedule:run`. See the [quick start](/quick-start/) for the full crontab entry.

### The Queue section shows no data

Make sure your queue workers are running (`php artisan queue:work`) and that your Redis connection is configured correctly in `config/queue.php`.

### Alerts are not firing

Check:
1. Your alert channel credentials are correct in `.env`
2. The condition threshold is actually being breached (check the monitor's last known values)
3. Alert deduplication hasn't suppressed the notification (5-minute window)

See [troubleshooting](/troubleshooting/) for detailed steps.
