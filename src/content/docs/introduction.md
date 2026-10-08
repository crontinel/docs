---
title: Introduction
description: Crontinel tells you when a background job finished without doing the work. Any runtime sends one HTTP receipt. Laravel adds schedule, queue, and Horizon evidence.
---

**Completed is not done.** A process can exit 0 and still produce nothing. Crontinel keeps process status and business result as separate states. Missing evidence is never shown as healthy.

## The problem

Generic monitors check whether a heartbeat arrived or a URL returned 200. They cannot tell you:

- That a nightly import exited 0 with `processed_records: 0`
- That a scheduled agent wrote an empty digest
- That Horizon or a queue stopped reporting freshness (Laravel package path)

## How it works

1. Your job posts an HTTP receipt to `/api/v1/ingest/cron` with the command, exit code, times, and optional outcome metrics.
2. Crontinel evaluates schedule and outcome rules on the server.
3. Alerts fire without waiting for a model. Your coding assistant can read the same evidence over MCP.

The [Laravel package](/sdks/laravel/) is the deep integration: it attaches that receipt from the scheduler and can add queue depth and Horizon freshness. Other languages use the [HTTP recipes](/check-in/recipes/). Unowned language packages are not a support claim.

## Plans and pricing

See the [pricing page](https://crontinel.com/pricing) on the marketing site for current tiers. Hosted monitoring and alerts do not depend on a language SDK.

## Open source

The Laravel package is MIT licensed. Self-hosted local dashboards are not a substitute for hosted detection when the same host dies.
