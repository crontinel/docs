---
title: SDKs & Packages
description: HTTP check-in works from every runtime. The Laravel package is the deep integration; Go, Ruby, Rust and Rails packages record runs without outcome metrics.
---

import { Card, CardGrid } from '@astrojs/starlight/components';

## Start here

Use the [HTTP check-in recipes](/check-in/recipes/) for curl, Python, Node, cron, GitHub Actions, Sidekiq, and agents. That path is finished without installing a language package.

## Maintained deep integration

<CardGrid>
  <Card title="crontinel/laravel" icon="seti:laravel">
    Laravel — schedule attach, queue depth, Horizon freshness
    [Install →](/installation/) · [Package docs →](/sdks/laravel/)
  </Card>
</CardGrid>

## Language packages

Each package below was installed and run against app.crontinel.com on 2026-11-16. Except for Laravel, they record that a job ran (finished or failed, and how long it took) but send no outcome metrics, so they cannot catch a job that finished but did nothing. For that, send the [HTTP check-in receipt](/check-in/recipes/) with a count.

| Runtime | Package | Status |
|---|---|---|
| Laravel | [`crontinel/laravel`](/sdks/laravel/) | Works, including the outcome receipt |
| Go | [`github.com/crontinel/go`](/sdks/go/) | Records runs (v0.1.1) |
| Ruby | [`crontinel` gem](/sdks/ruby/) | Records runs (0.1.1) |
| Rails | [`crontinel-rails`](/sdks/rails/) | Records Active Job and Sidekiq runs (0.1.1+) |
| Rust | [`crontinel` crate](/sdks/rust/) | Records runs (0.1.1+) |
| Node.js | [`@crontinel/node`](/sdks/node/) | Not usable from npm yet; use the HTTP check-in |
| Python | [`crontinel`](/sdks/python/) | Records runs (0.2.1+) |
| PHP | [`crontinel/php`](/sdks/php/) | No client; use the HTTP check-in |
| .NET | [.NET](/sdks/dotnet/) | No package; use the HTTP check-in |
| CLI | [`crontinel` CLI](/sdks/cli/) | Reads status and alerts (v0.1.1) |

## Which path to pick

| Your job runs in | Use |
|---|---|
| Laravel (schedule, queues, Horizon) | The [Laravel package](/sdks/laravel/), which also sends the HTTP receipt |
| Node, Python, Ruby, Sidekiq, Celery, GitHub Actions, plain cron | An [HTTP check-in recipe](/check-in/recipes/) |
| Anything else that can make an HTTP request | The same receipt: `POST /api/v1/ingest/cron` with your ingest key |

Whichever you choose, [register the job and its schedule](/check-in/schedule/) so a run that never starts raises an alert, and send a [start receipt](/check-in/start-finish/) if you also want to catch a run that never finishes.

For plan limits on ingest volume, see [billing and plans](/billing/).
