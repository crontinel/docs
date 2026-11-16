---
title: Ruby on Rails
description: crontinel-rails (0.1.1+) records every Active Job and Sidekiq run. For outcome metrics, send the HTTP check-in receipt.
---

The `crontinel-rails` gem records each Active Job and Sidekiq job run: finished or failed, and how long it took. It does not send outcome metrics, so it cannot catch a job that finished but did nothing. For that, send the [HTTP check-in receipt](/check-in/recipes/) with a count from inside the job (the Sidekiq and `Net::HTTP` recipe works the same way in an Active Job).

Use 0.1.1 or later. Version 0.1.0 sends nothing.

## Install

```ruby
gem "crontinel-rails", "~> 0.1.1"
```

```bash
bundle install
```

## Configure

Set your app's ingest key. That is all most apps need:

```bash
CRONTINEL_API_KEY=your_key_here
```

Or in `config/application.rb`:

```ruby
config.crontinel.api_key = ENV["CRONTINEL_API_KEY"]
config.crontinel.endpoint = "https://app.crontinel.com" # optional, for self-hosted
config.crontinel.enabled = true                         # false turns reporting off
```

Without an API key the gem reports nothing and your jobs run as usual.

## What it reports

- **Active Job:** every job reports one run when `perform` finishes, named by its class (`NightlyReportJob`). An exception reports a failed run and is re-raised.
- **Sidekiq:** plain Sidekiq workers report the same way through server middleware, which is added for you. Active Job jobs running on Sidekiq report once.

If Crontinel is unreachable, the gem logs a warning and your job's result is unchanged.

## Manual tracking

```ruby
Crontinel::Rails.track("nightly-import") do
  # your work
end
```

Runs go to the MCP endpoint (`/api/mcp`, `notify/schedule_run`), not the run receipt at `POST /api/v1/ingest/cron`.
