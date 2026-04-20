---
title: SDKs & Packages
description: Official Crontinel monitoring packages for every runtime
---

import { Card, CardGrid } from '@astrojs/starlight/components';

Crontinel has official monitoring packages for every major runtime. Pick the one that matches your stack.

<CardGrid>
  <Card title="@crontinel/node" icon="seti:nodejs">
    TypeScript/Node.js — BullMQ, Agenda, node-cron, workers
    [Installation →](/sdks/node/)
  </Card>
  <Card title="crontinel/python" icon="seti:python">
    Python — Celery, RQ, Huey, APScheduler, Prefect, Dramatiq
    [Installation →](/sdks/python/)
  </Card>
  <Card title="crontinel/go" icon="seti:go">
    Go — Asynq, Machinery, Temporal, gocron, native tickers
    [Installation →](/sdks/go/)
  </Card>
  <Card title="crontinel/rust" icon="seti:rust">
    Rust — Tokio, async-std, apalis, tokio-cron-scheduler
    [Installation →](/sdks/rust/)
  </Card>
  <Card title="crontinel/php" icon="seti:php">
    PHP — Framework-agnostic library, Symfony Messenger + plain cron
    [Installation →](/sdks/php/)
  </Card>
  <Card title="crontinel/laravel" icon="seti:laravel">
    Laravel — Horizon & scheduler, auto-detect, zero config
    [Installation →](/installation/)
  </Card>
  <Card title="crontinel/ruby" icon="seti:ruby">
    Ruby — Sidekiq, Resque, DelayedJob, Rake tasks
    [Installation →](/sdks/ruby/)
  </Card>
  <Card title="crontinel/rails" icon="seti:rails">
    Rails — Auto-instruments ActiveJob and ActiveScheduler
    [Installation →](/sdks/rails/)
  </Card>
  <Card title="crontinel/cli" icon="seti:shell">
    CLI / Docker — Wrap any cron, Docker job, K8s CronJob
    [Installation →](/sdks/cli/)
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
