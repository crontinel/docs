---
title: Troubleshooting
description: Fixes for common Crontinel issues with the dashboard, cron monitor, queue monitor, Horizon, alerts, CLI, and SaaS connection
---

## Dashboard not loading (404)

If you hit `/crontinel` and get a 404, the routes aren't registered. First, make sure you ran the install command:

```bash
php artisan crontinel:install
php artisan migrate
```

Then clear the route cache:

```bash
php artisan route:clear
```

If you're still getting a 404, check whether something else is already using the `/crontinel` path. Another package or a custom route can shadow it. Change the path in your `.env`:

```env
CRONTINEL_PATH=monitoring
```

### Auth middleware blocking access

The dashboard uses `['web', 'auth']` middleware by default. If you're getting redirected to a login page, you're not authenticated in your current session. For local development, you can temporarily loosen this in `config/crontinel.php`:

```php
'middleware' => ['web'],
```

Don't ship that to production. Instead, add whatever gate or policy middleware your app uses:

```php
'middleware' => ['web', 'auth', 'can:view-monitoring'],
```

## Cron runs not showing up

This is the most common issue people hit after installation. There are three things to check, in order.

### 1. Is the scheduler actually running?

Crontinel listens for Laravel's `ScheduledTaskStarting`, `ScheduledTaskFinished`, and `ScheduledTaskFailed` events. If the scheduler itself isn't running, there's nothing to capture. Verify it's set up in your server's crontab:

```bash
crontab -l | grep artisan
```

You should see something like:

```
* * * * * cd /path-to-your-app && php artisan schedule:run >> /dev/null 2>&1
```

If that line is missing, no scheduled tasks will run at all, and Crontinel will have nothing to record.

### 2. Did you run the migration?

Crontinel stores cron run history in a database table. If the table doesn't exist, events fire but there's nowhere to write them. Run:

```bash
php artisan migrate
```

Check that the `crontinel_cron_runs` table exists in your database.

### 3. Is the cron monitor enabled?

Open `config/crontinel.php` and confirm:

```php
'cron' => [
    'enabled' => true,
    'late_alert_after_seconds' => 120,
    'retain_days' => 30,
],
```

If `enabled` is `false`, the event listeners won't register and nothing gets tracked.

## Queue monitor showing no data

The queue monitor reads queue depth, failed job counts, and wait times. If it's showing zeros or nothing at all, the issue is almost always the queue driver.

### Wrong driver

Crontinel's queue monitor works with Redis and database drivers. If your `QUEUE_CONNECTION` is set to `sync`, there's no queue to monitor because jobs execute immediately. Check your `.env`:

```env
QUEUE_CONNECTION=redis
```

### Redis connection mismatch

If you're using Redis, make sure Crontinel can reach the same Redis instance your queues use. The queue monitor reads from whatever connection your `QUEUE_CONNECTION` points to in `config/queue.php`. If you've got a non-default Redis setup (custom host, port, or database number), Crontinel follows the same config, so there's nothing extra to set.

One thing that trips people up: if you use a separate Redis database for queues (say, database `1`) but your default Redis connection points to database `0`, the monitor might not see your queues. Double-check the `connection` value in your `config/queue.php` Redis driver config.

## Horizon monitor not working

Two things can cause the Horizon section to show nothing.

### Horizon not installed

The Horizon monitor reads Horizon's Redis keys directly. If you don't have `laravel/horizon` installed, there are no keys to read. Crontinel won't crash, but the Horizon section will be empty. Either install Horizon or disable the monitor:

```php
'horizon' => ['enabled' => false],
```

### Wrong Redis connection

Crontinel needs to connect to the same Redis instance Horizon uses. By default it looks for the `horizon` connection in your `config/database.php` Redis config. If Horizon uses a different connection name, update it:

```php
// config/crontinel.php
'horizon' => [
    'enabled' => true,
    'connection' => 'your-horizon-connection',
],
```

Here's the thing: if `horizon:status` returns `null` from Redis, Crontinel can't determine Horizon's state. Run `redis-cli` and check manually:

```bash
redis-cli -n 0 GET horizon:status
```

If that returns nothing but Horizon is definitely running, you're connected to the wrong Redis database.

## Alerts not firing

You've set thresholds, something is clearly broken, but no Slack message. No email. Here's where to look.

### No alert channel configured

Crontinel needs to know where to send alerts. Check that you've set the channel in your `.env`:

```env
CRONTINEL_ALERT_CHANNEL=slack
CRONTINEL_SLACK_WEBHOOK=https://hooks.slack.com/services/T00/B00/xxx
```

Or for email:

```env
CRONTINEL_ALERT_CHANNEL=mail
CRONTINEL_ALERT_EMAIL=ops@yourapp.com
```

If `CRONTINEL_ALERT_CHANNEL` is empty, Crontinel collects health data but doesn't send notifications anywhere.

### Deduplication window

The same alert won't re-fire for 5 minutes. So if a queue breached its threshold, Crontinel fired the alert, and you missed it, you won't see another one until the dedup window resets. Check your Slack channel's history or your email spam folder for the initial alert.

### Slack webhook URL invalid

Slack webhooks expire if the app is uninstalled or the channel is deleted. Test the webhook directly:

```bash
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"test"}' \
  https://hooks.slack.com/services/T00/B00/xxx
```

If that returns `invalid_payload` or `channel_not_found`, regenerate the webhook in your Slack app settings.

### SaaS alert channels

If you're using Crontinel SaaS (app.crontinel.com), alert channels are configured in the web dashboard, not in your local config. Your local `CRONTINEL_ALERT_CHANNEL` only applies to the self-hosted setup. The SaaS version manages channels, thresholds, and routing through its own UI.

## CLI check returns unexpected results

`php artisan crontinel:check` exits `0` when everything is healthy and `1` when any alert condition is active. If you're getting unexpected results:

```bash
php artisan crontinel:check --format=json
```

This prints the full status payload so you can see exactly which monitor is unhealthy and why. Common surprises:

The Horizon monitor reports unhealthy because a supervisor heartbeat is stale, even though `horizon:status` says `running`. Crontinel tracks each supervisor independently. A single dead supervisor triggers the unhealthy state. Restart Horizon to clear it:

```bash
php artisan horizon:terminate
php artisan horizon
```

If the CLI check shows healthy but your dashboard shows alerts, you might have a caching issue. Clear the application cache:

```bash
php artisan cache:clear
```

## SaaS connection issues

If you're using the hosted version at app.crontinel.com and your app isn't showing data there, check these things.

### API key

Your `.env` needs the API key from your Crontinel SaaS dashboard:

```env
CRONTINEL_API_KEY=cnt_live_xxxxxxxxxxxxxxxx
```

If the key is missing or wrong, the package falls back to local-only mode silently. No errors in your logs, just no data on the SaaS dashboard.

### Network and firewall

Your server needs outbound HTTPS access to `app.crontinel.com` on port 443. In containerized environments or strict firewall setups, this can be blocked. Test from your server:

```bash
curl -I https://app.crontinel.com/api/v1/ping
```

You should get a `200` response. If you get a timeout or connection refused, your firewall or network config is blocking outbound traffic.

### API URL override

If you're self-hosting the Crontinel backend, make sure the URL points to your instance:

```env
CRONTINEL_API_URL=https://crontinel.internal.yourcompany.com
```

The default is `https://app.crontinel.com`, so you only need this if you're running your own backend.

## Still stuck?

Run the full diagnostics:

```bash
php artisan crontinel:check --format=json
```

If the output doesn't point you to the issue, open a GitHub issue on [HarunRRayhan/crontinel](https://github.com/HarunRRayhan/crontinel/issues) with the JSON output and your Laravel version. Don't paste your API key or webhook URLs.
