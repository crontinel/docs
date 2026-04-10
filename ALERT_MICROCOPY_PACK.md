# Crontinel Alert Microcopy Pack

A reference for all user-facing strings: alert messages, empty states, recovery notices, warnings, first-run guidance, and error states. Tone is calm, direct, and developer-friendly. No jargon, no em dashes.

---

## 1. Alert Messages

### 1.1 Slack

**Cron: failed**
```
🔴 *Cron alert: {command}*
The command exited with code {exit_code}.
Schedule: {expression}
Last ran: {last_ran_at}
```

**Cron: late (missed run)**
```
⚠️ *Cron late: {command}*
Expected by {previous_due_at}, no run recorded.
Schedule: {expression}
```

**Cron: never run**
```
⚠️ *Cron not yet seen: {command}*
This command has never completed a run. Check that the scheduler is running.
Schedule: {expression}
```

**Queue: depth exceeded**
```
⚠️ *Queue depth alert: {queue}*
{depth} jobs pending (threshold: {threshold}).
Oldest job waiting: {oldest_age}.
```

**Queue: wait time exceeded**
```
⚠️ *Queue backlog: {queue}*
The oldest job has been waiting {oldest_age} (threshold: {threshold}).
Queue depth: {depth} jobs.
```

**Queue: failed jobs**
```
🔴 *Failed jobs in queue: {queue}*
{failed_count} jobs in the failed queue.
```

**Horizon: not running**
```
🔴 *Horizon is not running*
The Horizon process appears to have stopped.
Check your server or process manager.
```

**Horizon: paused**
```
⚠️ *Horizon is paused*
Horizon has been paused since {paused_since}.
Jobs are not being processed.
```

**Horizon: failed jobs rate exceeded**
```
🔴 *Horizon failure rate*
{failed_per_minute} jobs/min failing (threshold: {threshold}).
```

**Horizon: supervisor down**
```
🔴 *Horizon supervisor: {supervisor_name}*
Status is '{status}'. Expected 'running'.
```

---

### 1.2 Email

**Subject lines**

| Situation | Subject |
|---|---|
| Cron failed | [Crontinel] Cron failed: {command} |
| Cron late | [Crontinel] Cron missed schedule: {command} |
| Cron never run | [Crontinel] Cron never run: {command} |
| Queue depth exceeded | [Crontinel] Queue alert: {queue} |
| Horizon down | [Crontinel] Horizon is not running |
| Horizon paused | [Crontinel] Horizon is paused |
| Resolved | [Crontinel] Resolved: {original_title} |

**Email body (cron failed)**
```
Your scheduled command failed.

Command:     {command}
Exit code:   {exit_code}
Ran at:      {last_ran_at}
Schedule:    {expression}

Open your Crontinel dashboard to review the full run history.

{dashboard_url}
```

**Email body (queue depth)**
```
A queue has exceeded its depth threshold.

Queue:       {queue}
Depth:       {depth} jobs
Threshold:   {threshold}
Oldest job:  waiting {oldest_age}

{dashboard_url}
```

**Email body (Horizon down)**
```
Horizon is not running. Jobs in your queue are not being processed.

Check that your Horizon process is running on your server.

{dashboard_url}
```

---

### 1.3 Webhook Payload Comments

These are the `message` field values sent in the POST body.

| Event | message |
|---|---|
| Cron failed | `Command [{command}] exited with code {exit_code}.` |
| Cron late | `Command [{command}] has not run on schedule ({expression}).` |
| Cron never run | `Command [{command}] has never completed a run.` |
| Queue depth | `Queue '{queue}' depth is {depth} (threshold: {threshold}).` |
| Queue wait | `Oldest job in '{queue}' has been waiting {age}s (threshold: {threshold}s).` |
| Queue failed | `Queue '{queue}' has {count} failed jobs.` |
| Horizon down | `Horizon is not running.` |
| Horizon paused | `Horizon has been paused since {paused_since}.` |
| Horizon supervisor | `Supervisor [{name}] status is '{status}'.` |
| Horizon failure rate | `Failed jobs/min: {rate} (threshold: {threshold}).` |

---

## 2. Resolution / Recovery Messages

### Slack

**Generic resolved**
```
✅ *Resolved: {original_title}*
Back to healthy. Alert was open for {duration}.
```

**Cron recovered**
```
✅ *Cron recovered: {command}*
The command ran successfully at {ran_at} and exited with code 0.
```

**Queue cleared**
```
✅ *Queue back to normal: {queue}*
Depth is now {depth}. No backlog. Alert was open for {duration}.
```

**Horizon recovered**
```
✅ *Horizon is running*
Horizon process is healthy. Alert was open for {duration}.
```

### Email subject lines (resolved)

```
[Crontinel] Resolved: {original_title}
```

**Email body (resolved)**
```
The issue has been resolved.

Original alert:  {original_title}
Fired at:        {fired_at}
Resolved at:     {resolved_at}
Duration:        {duration}

{dashboard_url}
```

---

## 3. Warning States (Degraded, Not Critical)

These appear in the dashboard UI and as `level: warning` alerts.

**Cron: running late (grace period active)**
```
Running late. Last run was {last_ran_at}. Expected by {previous_due_at}.
Waiting {grace_elapsed} of {grace_period} grace period before alerting.
```

**Queue: approaching depth threshold**
```
Queue depth is at {percent}% of the {threshold}-job threshold ({depth} jobs).
```

**Queue: jobs waiting a while**
```
The oldest job in '{queue}' has been waiting {age}. Threshold is {threshold}.
```

**Horizon: high failure rate (approaching threshold)**
```
{failed_per_minute} jobs/min failing. Threshold is {threshold}/min.
```

**Horizon: supervisor reporting slow**
```
Supervisor '{name}' has not reported in {elapsed}. It may be unresponsive.
```

---

## 4. Dashboard Empty States

### No monitors configured (fresh install, nothing in scheduler)
```
No scheduled commands found.

Crontinel monitors the commands registered in your Laravel scheduler.
Add commands to your console kernel (or App\Console\Kernel) and they
will appear here automatically.
```

### Cron section: scheduler has commands but no runs recorded yet
```
No runs recorded yet.

Crontinel will record a run the first time each command completes.
Make sure the scheduler is running:
  php artisan schedule:run
```

### Queue section: no queues being watched
```
No queues to watch.

To monitor a specific queue, set CRONTINEL_QUEUES_WATCH in your .env:
  CRONTINEL_QUEUES_WATCH=default,emails

Or set the queues.watch array in config/crontinel.php.
```

### Queue section: no jobs ever seen
```
No queue activity yet.

This queue appears empty. If jobs are not being dispatched,
check that your application is connecting to the correct queue driver.
```

### Alerts tab: no alerts have fired
```
No alerts have fired.

Everything looks healthy. Crontinel will notify you here
(and via your configured channel) if a monitor trips.
```

### Horizon section: Horizon not enabled
```
Horizon monitoring is disabled.

Set CRONTINEL_HORIZON=true in your .env to enable Horizon health checks.
If you are not using Horizon, you can ignore this section.
```

---

## 5. First-Run Guidance

### After install (shown once, or on first dashboard visit with no data)
```
Crontinel is installed.

It will start recording data the next time your scheduler runs.
While you wait, you can:

  - Configure an alert channel so you get notified when something breaks.
  - Review the queue and Horizon settings in config/crontinel.php.
  - Connect to Crontinel SaaS for remote visibility across all your apps.

Your dashboard is at: {dashboard_url}
```

### No API key set (OSS mode, SaaS nudge)
```
Running in local mode.

To monitor this app from app.crontinel.com, add your API key:
  CRONTINEL_API_KEY=your-key-here
```

### Alert channel not configured
```
No alert channel configured.

Crontinel is monitoring your crons and queues, but has nowhere to send alerts.
Set CRONTINEL_ALERT_CHANNEL in your .env to enable notifications.

Supported: slack, mail, webhook
```

---

## 6. Error States

### Slack: webhook URL missing
```
Slack alert channel is set, but CRONTINEL_SLACK_WEBHOOK is not configured.
Add the webhook URL to your .env to start receiving Slack alerts.
```

### Email: recipient missing
```
Mail alert channel is set, but CRONTINEL_ALERT_EMAIL is not configured.
Add the recipient address to your .env.
```

### Webhook: URL missing
```
Webhook alert channel is set, but CRONTINEL_WEBHOOK_URL is not configured.
Add the endpoint URL to your .env.
```

### Horizon: Redis connection failed
```
Could not connect to Redis to check Horizon status.
Verify that your Redis connection is configured and reachable.
Error: {error_message}
```

### Queue: database unavailable
```
Could not read queue depth from the database.
Check that your database connection is working.
Error: {error_message}
```

### SaaS: report failed (logged, not surfaced to users)
```
Failed to report status to Crontinel SaaS.
Check your CRONTINEL_API_KEY and that app.crontinel.com is reachable.
Error: {error_message}
```

### Dashboard: check command failed
```
The last health check did not complete successfully.
Run 'php artisan crontinel:check' manually to see the full output.
```

### Config: invalid cron expression
```
Could not parse the cron expression for '{command}': {expression}
Crontinel cannot determine the next run time until this is corrected.
```

### Config: unknown alert channel
```
Alert channel '{channel}' is not supported.
Supported values: slack, mail, webhook
Check CRONTINEL_ALERT_CHANNEL in your .env.
```

---

## Notes for Implementation

- All durations should use human-readable format: "2 minutes", "14 seconds", not raw seconds.
- `fired_at` and `resolved_at` should use local app timezone, not UTC.
- Dashboard empty states should include a link to the relevant docs page where helpful.
- Log errors with `Log::error('Crontinel: ...')` prefix so they are filterable in log aggregators.
- Resolution messages should always echo the original alert title to make incident timelines easy to read.
