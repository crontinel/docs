---
title: SDKs & Packages
description: HTTP check-in is the path for every runtime. The Laravel package is the maintained deep integration. Other language repos are not a support claim until they send the outcome receipt and have an owner.
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

## Other language repos

GitHub may still list Node, Python, Go, Rust, PHP, Ruby, Rails, CLI, and .NET packages. They are **not** claimed as supported for the current outcome-receipt offer until each package sends that receipt and has a maintenance owner. Prefer [check-in recipes](/check-in/recipes/).

Historical pages remain under `/sdks/*` for reference. Do not treat them as install instructions for production monitoring.

## Which path to pick

| Your job runs in | Use |
|---|---|
| Laravel (schedule, queues, Horizon) | The [Laravel package](/sdks/laravel/), which also sends the HTTP receipt |
| Node, Python, Ruby, Sidekiq, Celery, GitHub Actions, plain cron | An [HTTP check-in recipe](/check-in/recipes/) |
| Anything else that can make an HTTP request | The same receipt: `POST /api/v1/ingest/cron` with your ingest key |

Whichever you choose, [register the job and its schedule](/check-in/schedule/) so a run that never starts raises an alert, and send a [start receipt](/check-in/start-finish/) if you also want to catch a run that never finishes.

The older per-language pages ([Node.js](/sdks/node/), [Python](/sdks/python/), [Go](/sdks/go/), [Rust](/sdks/rust/), [PHP](/sdks/php/), [Ruby](/sdks/ruby/), [Rails](/sdks/rails/), [CLI](/sdks/cli/), [.NET](/sdks/dotnet/)) are kept for reference only. For plan limits on ingest volume, see [billing and plans](/billing/).
