---
title: "Laravel Queue Monitoring: Catch Failures Before Your Users Do"
description: "Failed queue jobs silently pile up while your users wait for emails, receipts, and notifications that never arrive. Here's how to monitor your Laravel queues before they become user-visible problems."
date: 2026-04-15
tags: ["laravel", "queues", "monitoring"]
---

Every Laravel application eventually learns about queues the hard way. It starts with a user complaining they did not receive their welcome email. Then another. Then a batch. By the time someone checks the queue, there are thousands of failed jobs, a database connection that timed out, and an inbox full of confused customers asking where their receipts went.

This is not a hypothetical. It is the most common production incident for Laravel applications that rely heavily on queued work, and it happens because queues are designed to be invisible. When a job fails, it does not crash your app. It just sits in the failed_jobs table, quietly waiting for someone to notice.

Laravel queue monitoring exists to make the invisible visible, so you can fix problems before your users feel them.

## How Laravel Queues Work (and Why They Fail Silently)

Laravel's queue system moves time-consuming work out of the HTTP request cycle. Instead of making a user wait while an email sends, an image processes, or an API call completes, you dispatch a job to a queue worker. The worker picks it up in the background, processes it, and moves on.

The architecture is elegant. The failure mode is not.

When a job throws an exception, Laravel catches it, marks the job as failed, and — if you have configured it — moves it to the `failed_jobs` table. The queue worker logs the error and continues processing the next job. Your application keeps running. Users keep browsing. No HTTP requests fail.

This is exactly the problem. The failure is invisible unless you know to look for it. There is no error page, no 500 response, no alert. The job simply did not do what it was supposed to do, and no one knows until the business impact lands in your support queue.

## Why Queue Failures Cluster

Queue failures rarely happen one at a time. They cluster. A deployment breaks an API client, and every job that calls it fails in rapid succession. A third-party email provider goes down, and your mail queue backs up across every user who signed up in the last hour. A database migration locks a table, and queue workers start timing out on jobs that were working fine five minutes ago.

When failures cluster, the window between the first failure and the last is when you have the best chance to respond. If you get an alert after 10 failed jobs, you can investigate, find the root cause, and either fix it or dispatch a backfill job to redo the work. If you find out after 10,000 failed jobs, the damage is much larger.

This is the core argument for queue monitoring: it converts a silent, accumulating problem into an alertable, fixable incident.

## What Laravel Queue Monitoring Actually Tracks

Queue monitoring is not just watching for failures. A complete monitoring setup gives you visibility across several dimensions.

**Queue depth** — How many jobs are sitting in a queue waiting to be processed? A queue that normally has 50 pending jobs suddenly holding 5,000 is a sign that workers are falling behind or have stopped processing entirely.

**Job success rate** — What percentage of jobs succeed versus fail? Tracking this over time tells you whether your queue is healthy or degrading. A steady 99.9% success rate that drops to 97% over a week is easier to catch and fix than a sudden spike to 50%.

**Processing time** — How long does a typical job take? If jobs that normally process in 200ms suddenly start taking 30 seconds, something is wrong. Slow jobs pile up, workers get backlogged, and the entire queue backs up behind whatever is causing the slowdown.

**Worker availability** — Are your queue workers actually running? A worker that crashes and does not restart is functionally the same as a stopped queue. You need to know when workers go down, not just when jobs fail.

**Retry exhaustion** — Laravel lets you specify how many times a job should be retried before it is moved to the failed_jobs table. When a job exhausts its retries, it is a signal that something fundamental is broken — not a transient error.

Crontinel monitors all of these dimensions. The dashboard shows your queues in real time, and you can configure alert thresholds so you know about problems within minutes rather than hours.

## Setting Up Laravel Queue Monitoring with Crontinel

Crontinel integrates with your Laravel queue system through a service provider that hooks into Laravel's queue events.

```bash
composer require crontinel/laravel
php artisan crontinel:install
```

The installer publishes a config file and sets up the necessary database tables. After installation, Crontinel automatically tracks all jobs dispatched through Laravel's queue system.

```php
// config/crontinel.php
return [
    'enabled' => true,
    'queues' => [
        'default' => [
            'alert_threshold' => 100,       // Alert when 100+ jobs are waiting
            'slow_job_threshold' => 30,    // Alert when a job takes longer than 30s
            'failure_alert_threshold' => 5, // Alert after 5+ consecutive failures
        ],
        'emails' => [
            'alert_threshold' => 50,
            'slow_job_threshold' => 10,
            'failure_alert_threshold' => 3,
        ],
    ],
];
```

You can configure different thresholds for different queues. Your email queue might need stricter monitoring than your analytics queue, because failed emails mean users do not get receipts, confirmations, or password resets.

## Monitoring Failed Jobs

Laravel stores failed jobs in the `failed_jobs` table by default. Crontinel reads this table and surfaces failures in a dedicated view, so you do not have to dig through logs or run raw SQL queries.

```php
// config/crontinel.php
'failed_jobs' => [
    'retention_days' => 30,          // Keep failed job records for 30 days
    'alert_on_new_failure' => true, // Alert immediately when a job fails
    'notify_after_retries' => 3,     // Only alert after 3 retry attempts
],
```

You can also configure Crontinel to alert only after a job has exhausted its retry attempts, which reduces noise from transient failures that resolve themselves on the next try.

## Alerting That Reaches the Right People

A failed job alert that arrives two hours later is nearly useless. Crontinel sends alerts through channels your team actually watches.

```php
// config/crontinel.php
'alerts' => [
    'slack' => [
        'webhook_url' => env('CRONTINEL_SLACK_WEBHOOK'),
        'channel' => '#queue-alerts',
        'throttle_minutes' => 5,  // Do not spam more than once per 5 minutes
    ],
    'email' => [
        'to' => ['devops@yourcompany.com'],
        'only_critical' => true,
    ],
    'webhook' => [
        'url' => env('CRONTINEL_WEBHOOK_URL'),
        'events' => ['job_failed', 'queue_backed_up', 'worker_down'],
    ],
],
```

The throttle setting is important for queues that process thousands of jobs per minute. If your email provider goes down for 10 minutes, you do not want 10,000 Slack messages. Throttling ensures you get one alert with context, not an overwhelming flood.

## Common Queue Failure Patterns

Understanding why queues fail helps you respond faster when they do.

**Third-party service timeouts** — Jobs that call external APIs are vulnerable to provider outages. If your email provider is down, every email job fails until it comes back. Setting a reasonable timeout and implementing circuit breakers prevents prolonged hammering of a service that is already struggling.

**Database connection exhaustion** — If your queue workers share a connection pool with your web server, a traffic spike can starve workers of connections. Workers then time out waiting for a connection, and the queue backs up. Dedicated connection pools for queues prevent this.

**Memory leaks** — Long-running queue workers can accumulate memory over time. Laravel's queue worker configuration includes a `memory_limit` setting that restarts the worker after it exceeds a threshold. Without monitoring, you would not know this is happening until jobs start processing very slowly.

**Serialization errors** — Jobs that serialize model instances can fail if the model is deleted before the job runs. This is a common source of silent failures with Eloquent model jobs. Using job IDs or queue-safe identifiers instead of model instances reduces this risk.

## How to Respond When Your Queue Is Backed Up

When you get an alert that your queue is failing, the first step is to check why. Look at the failed_jobs table to see what exception the jobs are throwing. If a single exception type dominates, you have a systemic issue — a breaking change, a service outage, a deployment that went wrong.

```bash
php artisan queue:failed
```

Once you understand the failure mode, you have a few options. If the issue is fixed (the API is back up, the bug is patched), you can retry the failed jobs:

```bash
php artisan queue:retry --failed
```

If the failure is systemic and retrying would just cause the same failures, you need to fix the root cause first. If jobs have been failing for a while and you need to replay them in batches, Crontinel's dashboard lets you selectively retry ranges rather than all failed jobs at once.

## Preventing Future Failures

Monitoring catches problems, but prevention is better. A few practices reduce queue failures in production.

**Implement circuit breakers** — When a third-party service is down, stop dispatching jobs that depend on it. You can check service health before dispatching or use Laravel's built-in rate limiting to reduce load on failing services.

**Set appropriate retry limits** — Jobs that fail repeatedly waste resources and create noise. Set retry limits that reflect the job's importance. Critical jobs like payment processing might retry more times with longer delays. Background jobs like welcome emails might fail faster so you know about the problem sooner.

**Use job middleware for resilience** — Laravel's middleware system lets you add timeout handling, retry logic, and error handling at the middleware level rather than per-job.

**Monitor your queue depth over time** — A queue that is always at 500 jobs might be healthy, but a queue that has grown from 50 to 500 over a month is a sign that work is piling up faster than workers can process it. Tracking trends catches this before it becomes an incident.

## Get Started

Queue failures are inevitable. Prolonged, user-visible queue failures are not. With proper monitoring, you find out about problems minutes after they start, not days later when a customer files a complaint.

The [quick start guide](/docs/quick-start) walks through installing Crontinel and configuring your first queue alert in under five minutes. If you use Laravel Horizon, Crontinel shares your Redis connection and begins monitoring immediately after installation.

Your queue has been running in the background this whole time. It is time to start listening to what it is telling you.

[Start monitoring your Laravel queues →](/docs/quick-start)
