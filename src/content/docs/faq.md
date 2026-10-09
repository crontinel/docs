---
title: FAQ
description: HTTP check-in for any runtime, optional Laravel package depth, Octane notes, what is sent to the hosted app, and Starter/Pro/Max billing pointers.
---

## Do I need Laravel?

No. Every runtime posts the same HTTP outcome receipt. First-class paths: curl, Node, Python, Sidekiq, and GitHub Actions. See [check-in recipes](/check-in/recipes/) and [quick start](/quick-start/).

Laravel is optional. Use `crontinel/laravel` when you want the package to attach that receipt from the scheduler and add queue depth or Horizon freshness.

## Do I need a crontinel.com account?

For hosted alerts and the dashboard, yes — create an app and use the ingest key (`CRONTINEL_INGEST_KEY`). That key is not an MCP / assistant key.

The Laravel package can also run a local `/crontinel` dashboard without a hosted account. That local path is not a substitute for hosted detection when the same host dies.

## How do I send my first receipt?

1. Create an app at [app.crontinel.com](https://app.crontinel.com/register).
2. Copy the ingest key.
3. POST to `/api/v1/ingest/cron` when the job finishes (curl, Node `fetch`, `outcome_checkin.py`, Sidekiq, or GitHub Actions).
4. Send `processed_records: 0`, confirm the outcome alert, then send a later count and confirm recovery.

Recipes: [check-in recipes](/check-in/recipes/).

## Will Crontinel slow down my application?

For HTTP check-in, you control when the POST runs (usually after the job). Keep a short timeout and do not fail the business job if monitoring fails.

On Laravel with the package, monitoring listens to scheduler events. When `CRONTINEL_API_KEY` is set, the package reports over HTTP with a short timeout; a monitoring failure does not fail your task. Omit the key for local-only dashboard use.

## Does the Laravel package work with Octane?

Yes. It uses standard service provider and event patterns. Keep queue workers separate from the Octane server, as Laravel recommends generally.

## What happens if app.crontinel.com goes down?

Your jobs keep running. Receipts that cannot be delivered should not fail the business work (recipes use `|| true` / rescue where shown). On Laravel with only a local dashboard, that dashboard stays independent of the hosted app.

## What data is sent to the hosted app?

Nothing until you use an ingest key. A receipt can include command / job name, status, exit code, times, and optional outcome metrics or timestamps you set. Queue and Horizon snapshots are Laravel-package paths only.

**No application payloads, user PII, or environment secrets should be put in the receipt.**

## What are the plan names and prices?

Paid plans are **Starter**, **Pro**, and **Max** (internal Max key remains `team`). Free remains $0. See [Billing & Plans](/billing/) for allowances. The marketing price card stays gated until billing acceptance; [crontinel.com/pricing](https://crontinel.com/pricing/) shows what is published today.

## How do I upgrade the Laravel package?

```bash
composer require crontinel/laravel:^0.8
php artisan migrate
php artisan crontinel:check
```

See the [changelog](https://github.com/crontinel/laravel/blob/main/CHANGELOG.md) and [upgrading](/upgrading/).

## Where is the comparison or Slack on the price card?

Comparison publish and sold Slack/webhook channels wait on operator interviews and delivery verification (customer tasks S7–S10). Email outcome alerts are the verified channel today.
