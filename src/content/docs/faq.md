---
title: FAQ
description: Frequently asked questions about Crontinel
---

## Do I need a crontinel.com account to use Crontinel?

No. The OSS package (`crontinel/laravel`) works entirely standalone. Install it, run `php artisan crontinel:install`, and your local dashboard is available at `/crontinel` with no account, API key, or external connection required.

A crontinel.com account is optional — it gives you a hosted dashboard, cross-app visibility, and alerting without managing your own server. If you want local-only monitoring, you never need to sign up.

---

## Will Crontinel slow down my application?

No. All monitoring work happens asynchronously through Laravel's event system. Crontinel listens to scheduler events (`ScheduledTaskStarting`, `ScheduledTaskFinished`, `ScheduledTaskFailed`) and dispatches jobs to record the data. The job dispatch is non-blocking — your scheduled tasks run at full speed.

The only synchronous overhead is a tiny event listener registration at app boot, which is negligible.

---

## Does Crontinel work with Laravel Octane?

Yes. Crontinel is compatible with Laravel Octane (Swoole and RoadRunner). The package uses standard Laravel service provider and event patterns that Octane respects. There are no static state issues because all data is stored in the database, not in-memory.

If you run Octane, make sure your queue worker is separate from your Octane server — this is the standard Laravel recommendation and applies to Crontinel like any other queued job.

---

## What happens if app.crontinel.com goes down?

Nothing breaks locally. Your self-hosted dashboard continues working independently. Crontinel reports data to the SaaS endpoint only if `CRONTINEL_API_KEY` is set — and only when a connection is available. If the SaaS is unreachable, the package logs a warning and continues without blocking your app.

Your scheduler runs, your jobs execute, and your local `/crontinel` dashboard stays current regardless of SaaS availability.

---

## What data does the package send to the SaaS?

Nothing is sent unless you set `CRONTINEL_API_KEY`. When the key is present, the package sends:

- Cron run summaries: command name, status (`completed`/`failed`/`late`), duration, exit code
- Queue depth snapshots: queue name, depth count, failed job count
- Horizon status: running/paused, failed-per-minute rate, supervisor count

**No application data, no user data, no request payloads, and no environment variables are ever sent.**

---

## What are the Free plan limits?

The Free plan on app.crontinel.com includes:

- **1 app**
- **7-day history**
- **1 team member**
- **No alert channels**

For alert channels, team collaboration, and longer history, see the [pricing page](https://crontinel.com/pricing) for Pro and Team plan details.

---

## How do I upgrade to a new version?

```bash
composer update crontinel/laravel
php artisan migrate
php artisan crontinel:check
```

Migrations are always additive — running `php artisan migrate` is safe alongside your existing app migrations. Check the [changelog](https://github.com/crontinel/laravel/blob/main/CHANGELOG.md) before upgrading across major versions.

If a new release adds config options, re-publish the config file to see the new defaults:

```bash
php artisan vendor:publish --tag=crontinel-config --force
```

Compare the output with your existing `config/crontinel.php` and add any new keys you need.

---

## How do I configure alert channels in the OSS version?

Set the channel and credentials in `.env`:

```env
# Slack
CRONTINEL_ALERT_CHANNEL=slack
CRONTINEL_SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Email
CRONTINEL_ALERT_CHANNEL=email
CRONTINEL_ALERT_EMAIL=you@example.com

# Webhook
CRONTINEL_ALERT_CHANNEL=webhook
CRONTINEL_WEBHOOK_URL=https://your-endpoint.example.com/alerts
```

Only one channel is active at a time (set by `CRONTINEL_ALERT_CHANNEL`). For multiple channels simultaneously, use the hosted SaaS which supports per-app channel routing through the web UI.

See [Alert Channels](/alerts/channels) for full configuration details including `config/crontinel.php` snippets.
