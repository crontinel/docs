---
title: SDKs & Packages
description: Official Crontinel monitoring packages for every runtime
---

import { Card, CardGrid } from '@astrojs/starlight/components';

Crontinel has official monitoring packages for every major runtime. Each page below has a **quickstart** you can follow from scratch to first data in under 5 minutes.

<CardGrid>
  <Card title="@crontinel/node" icon="seti:nodejs">
    TypeScript/Node.js — BullMQ, Agenda, node-cron, workers
    [Quickstart →](/sdks/node/#quickstart)
  </Card>
  <Card title="crontinel/python" icon="seti:python">
    Python — Celery, RQ, Huey, APScheduler, Prefect, Dramatiq
    [Quickstart →](/sdks/python/#quickstart)
  </Card>
  <Card title="crontinel/go" icon="seti:go">
    Go — Asynq, Machinery, Temporal, gocron, native tickers
    [Quickstart →](/sdks/go/#quickstart)
  </Card>
  <Card title="crontinel/rust" icon="seti:rust">
    Rust — Tokio, async-std, apalis, tokio-cron-scheduler
    [Quickstart →](/sdks/rust/#quickstart)
  </Card>
  <Card title="crontinel/php" icon="seti:php">
    PHP — Framework-agnostic library, Symfony Messenger + plain cron
    [Quickstart →](/sdks/php/#quickstart)
  </Card>
  <Card title="crontinel/laravel" icon="seti:laravel">
    Laravel — Horizon & scheduler, auto-detect, zero config
    [Quickstart →](/installation/#quickstart)
  </Card>
  <Card title="crontinel/ruby" icon="seti:ruby">
    Ruby — Sidekiq, Resque, DelayedJob, Rake tasks
    [Quickstart →](/sdks/ruby/#quickstart)
  </Card>
  <Card title="crontinel/rails" icon="seti:rails">
    Rails — Auto-instruments ActiveJob and ActiveScheduler
    [Quickstart →](/sdks/rails/#quickstart)
  </Card>
  <Card title="crontinel/cli" icon="seti:shell">
    CLI / Docker — Wrap any cron, Docker job, K8s CronJob
    [Quickstart →](/sdks/cli/#quickstart)
  </Card>
  <Card title="Crontinel.NET" icon="seti:csharp">
    .NET / C# — Hangfire, Quartz.NET, TaskScheduler, Worker Service
    [Quickstart →](/sdks/dotnet/#quickstart)
  </Card>
</CardGrid>

## How it works

Every SDK shares the same wire format — report what your jobs, queues, and schedulers are doing via a simple API call. Crontinel records every run and alerts you when something goes wrong.

All packages are MIT licensed and work with the open-source Crontinel dashboard or the hosted SaaS at [app.crontinel.com](https://app.crontinel.com).

## API key

Sign up at [app.crontinel.com](https://app.crontinel.com) to get your free API key. Add it as an environment variable:

```env
CRONTINEL_API_KEY=crn_live_...
```
