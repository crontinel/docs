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
CRONTINEL_PATH=monitoring  # Required environment variable
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

## Runs from curl, Node, Python, Sidekiq, or GitHub Actions not showing up

Check these in order. The Laravel steps further down do not apply.

1. **Status code.** Remove `|| true` once and look at the response. `422` names the missing field. `started_at`, `command`, and `status` are required. `401` is a wrong or revoked key. Use the app **ingest key**, not an MCP key.
2. **Timestamps.** `started_at` and `finished_at` are ISO 8601 and must not be more than five minutes in the future.
3. **Same key, different run.** `409` means the `request_key` was already used for another identity or a finished run. Use a new key for each execution.
4. **Coverage says unknown.** Register the job with [a schedule](/check-in/schedule/). Crontinel does not read crontab or your scheduler.
5. **No missed-run alert.** The job needs a cron `expression` in its registration, and Crontinel checks only occurrences after you registered it. Its receipts must use the same `command`.

## Cron runs not showing up (Laravel)

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

Check that the `crontinel_runs` table exists in your database.

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

### Queues on a second connection

Crontinel reports the queues of the one connection in `QUEUE_CONNECTION`. If a Horizon supervisor works a different connection (for example `redis_b`), its queues are not reported by default: they show no depth and raise no backlog alert, and `crontinel.queues.watch` does not change that. From package v0.9.9, list the connection in [`crontinel.queues.connections`](/reference/configuration/#queuesconnections) (`'connections' => ['redis_b' => ['emails']]`) and its queues are reported as `redis_b:emails`. Horizon itself is still monitored: a running master and a supervisor on any connection show up in its status. Tested with Horizon 5.51 and two Redis connections on v0.9.8.

### Redis connection mismatch

If you're using Redis, make sure Crontinel can reach the same Redis instance your queues use. The queue monitor reads from whatever connection your `QUEUE_CONNECTION` points to in `config/queue.php`. If you've got a non-default Redis setup (custom host, port, or database number), Crontinel follows the same config, so there's nothing extra to set.

One thing that trips people up: if you use a separate Redis database for queues (say, database `1`) but your default Redis connection points to database `0`, the monitor might not see your queues. Double-check the `connection` value in your `config/queue.php` Redis driver config.

## Horizon says a supervisor is not running

From package v0.9.10, a supervisor that `horizon.environments` lists for this environment but that is not running is reported after [`supervisor_alert_after_seconds`](/reference/configuration/#horizonsupervisor_alert_after_seconds). Two usual causes: the supervisor crashed and Horizon did not bring it back, or you added it to `config/horizon.php` and did not restart Horizon (`php artisan horizon:terminate`, then let your process manager start it again). The alert resolves when the supervisor is running. If your environment name does not match a key in `horizon.environments`, nothing is checked.

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

Crontinel reads Horizon's state from the `masters` sorted set and the `master:<name>` hash on that connection. Horizon stores these keys under its own Redis prefix, so list the masters with the full prefixed key name, for example:

```bash
redis-cli -n 0 ZRANGE <your-horizon-prefix>masters 0 -1
```

If that returns nothing but Horizon is definitely running, you're connected to the wrong Redis database or using the wrong prefix.

## Alerts not firing

You've set thresholds, something is clearly broken, but no Slack message. No email. Here's where to look.

### No alert channel configured

Crontinel needs to know where to send alerts. Check that you've set the channel in your `.env`:

```env
CRONTINEL_ALERT_CHANNEL=slack  # Required environment variable
CRONTINEL_SLACK_WEBHOOK=https://hooks.slack.com/services/T00/B00/xxx  # Required environment variable
```

Or for email:

```env
CRONTINEL_ALERT_CHANNEL=mail
CRONTINEL_ALERT_EMAIL=ops@yourapp.com
```

If `CRONTINEL_ALERT_CHANNEL` is empty, Crontinel collects health data but doesn't send notifications anywhere.

### `crontinel:check` is not scheduled

The package evaluates local alerts only when `crontinel:check` runs. From v0.9.12 it schedules the command itself when `CRONTINEL_ALERT_CHANNEL` is set; check `php artisan schedule:list` and that your scheduler is running. On earlier versions, add it to your scheduler yourself:

```php
$schedule->command('crontinel:check')->everyMinute();
```

### Deduplication window

The same alert won't re-fire for 5 minutes. If the condition is still active after that, the next `crontinel:check` sends it again. So if you missed an alert, wait for the next one or look back through your history. Check your Slack channel's history or your email spam folder for the initial alert.

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

The Horizon check fails even though Horizon's master is running. Crontinel checks each supervisor: one that `horizon.environments` lists but is not running (see [supervisor not running](#horizon-says-a-supervisor-is-not-running)) makes `crontinel:check` exit non-zero. Restart Horizon to clear it:

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
CRONTINEL_API_KEY=your-app-key  # Required environment variable
```

If the key is missing, the package does not report to the SaaS at all and logs nothing. If the key is wrong, the hosted app rejects the reports. Each rejected cron run report logs the warning `Crontinel: failed to report cron run to SaaS`; the per-minute status report is not logged.

### Network and firewall

Your server needs outbound HTTPS access to `app.crontinel.com` on port 443. In containerized environments or strict firewall setups, this can be blocked. Test from your server:

```bash
curl -I https://app.crontinel.com/up
```

You should get a `200` response. If you get a timeout or connection refused, your firewall or network config is blocking outbound traffic.

### API URL override

If you're self-hosting the Crontinel backend, make sure the URL points to your instance:

```env
CRONTINEL_API_URL=https://crontinel.internal.yourcompany.com  # Required environment variable
```

The default is `https://app.crontinel.com`, so you only need this if you're running your own backend.

## Dashboard is completely empty after install

You installed the package, ran migrations, opened `/crontinel`, and every section is blank. No cron data, no queue data, nothing.

### Nothing has run yet

Crontinel does not generate synthetic data. It only shows real activity from your app. If your scheduler has not executed since install, the cron section will be empty. If your queues have no pending jobs, the queue section will show zeros. This is correct behavior.

To seed initial data, trigger a scheduler tick:

```bash
php artisan schedule:run
```

Or, for local development, start the scheduler worker:

```bash
php artisan schedule:work
```

Queue data appears as soon as jobs are dispatched. Push a test job to confirm:

```bash
php artisan tinker --execute="dispatch(fn() => logger('test'));"
```

Refresh the dashboard after each step. Data should appear within a few seconds.

### Service provider not registered

If the dashboard route exists but shows a blank page with no data at all, the service provider may not be loading. Verify it is discovered:

```bash
php artisan about | grep -i crontinel
```

If Crontinel does not appear in the output, check that `composer require` completed successfully and that you are not blocking auto-discovery in your `composer.json` `extra.laravel.dont-discover` array.

## Cron runs recorded but alerts are not firing

The cron section shows runs (including failures or late tasks), but you never receive an alert. This is different from the "alerts not firing" section above, which covers channel configuration. Here the channel is set up, but specific cron thresholds are not.

### Late-run threshold not configured

Crontinel only fires a "late cron" alert when a task exceeds the `late_alert_after_seconds` value. If this is set too high (or left at the default), tasks that are a few minutes late won't trigger anything. Check your config:

```php
// config/crontinel.php
'cron' => [
    'enabled' => true,
    'late_alert_after_seconds' => 120,  // fires if a task is >2 minutes late
    'retain_days' => 30,
],
```

Lower the value if you need tighter alerting. For example, setting it to `60` will fire alerts for tasks that are more than one minute late.

### Failed-run alerts require the alert channel and `crontinel:check`

Even if a cron task exits with a non-zero code, Crontinel only sends a notification if `CRONTINEL_ALERT_CHANNEL` is configured and `crontinel:check` runs on a schedule (automatic from v0.9.12 once the channel is set; on earlier versions add `$schedule->command('crontinel:check')->everyMinute();`). If you see failed runs in the dashboard but get no alerts, go back to the [alerts not firing](#alerts-not-firing) section and verify your channel setup.

### Dedup window hiding repeated failures

If the same task fails repeatedly, Crontinel deduplicates alerts within a 5-minute window. The first failure fires an alert; later checks within that window are suppressed. If the task is still failing when the window expires, the next check fires the alert again.

## Still stuck?

Run the full diagnostics:

```bash
php artisan crontinel:check --format=json
```

If the output doesn't point you to the issue, open a GitHub issue on [crontinel/laravel](https://github.com/crontinel/laravel/issues) with the JSON output and your Laravel version. Don't paste your API key or webhook URLs.
