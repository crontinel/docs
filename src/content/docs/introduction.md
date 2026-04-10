---
title: Introduction
description: What Crontinel is and why it exists
---

Crontinel monitors your background jobs, queue depths, and cron schedules. It reads framework internals  –  not just HTTP pings  –  so you know what's actually happening inside your app.

## The problem

Generic monitors check whether a URL returns 200 or whether a heartbeat arrived. They cannot tell you:

- That your Laravel Horizon supervisor for the `emails` queue silently crashed
- That queue depth is at 8,000 and climbing
- That `send-invoices` ran but exited with code 1

Crontinel hooks into your app directly and surfaces this data.

## How it works

The OSS package (`crontinel/laravel`) installs in your Laravel app and:

1. Reads Horizon's Redis keys for supervisor and pause state
2. Queries queue depths from Redis or the database
3. Listens to Laravel's scheduler events to record every cron run

The optional SaaS at [app.crontinel.com](https://app.crontinel.com) gives you a hosted multi-app dashboard, longer history retention, team access, and alerts.

## Open source first

The core package is MIT licensed. Install it in two commands and get a full dashboard with no account required:

```bash
composer require crontinel/laravel
php artisan crontinel:install
```
