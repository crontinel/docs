---
title: Ruby
description: Prefer the HTTP check-in recipes for Ruby / Sidekiq. The Ruby gem is not a supported outcome-receipt path until it has a maintenance owner.
---

import { Aside } from '@astrojs/starlight/components';

<Aside type="caution">
For outcome monitoring, use the [HTTP check-in recipes](/check-in/recipes/). This language package is **not** a supported path for the current offer until it sends the outcome receipt and has a maintenance owner. Prefer curl, Node `fetch`, `outcome_checkin.py`, Sidekiq/`Net::HTTP`, or GitHub Actions.
</Aside>

## Quickstart

Historical package install steps below. Prefer [check-in recipes](/check-in/recipes/) for new setups.

Get from zero to your first data in under 3 minutes.

### 1. Prerequisites

- Ruby 3.0+
- A Crontinel account ([sign up free](https://app.crontinel.com/login))
- An app created in the dashboard
- Your app's API key from app settings

### 2. Install

```bash
gem install crontinel
```

Or add to your `Gemfile`:

```ruby
gem "crontinel", "~> 0.1"
```

### 3. Configure

Create a `quickstart.rb` file:

```ruby
require "crontinel"

client = Crontinel.client(api_key: ENV["CRONTINEL_API_KEY"])

client.task_finished(name: "hello-from-ruby", duration_ms: 100)

puts "Data sent to Crontinel!"
```

Set your API key and run it:

```bash
export CRONTINEL_API_KEY=your-app-key
ruby quickstart.rb
```

### 4. Dashboard verification

1. Go to [app.crontinel.com](https://app.crontinel.com) → **Apps** → your app
2. Check the **Cron** section — you should see the `hello-from-ruby` job with `100ms` duration
3. Your first data is on the dashboard!

<Aside>
If the cron section shows "no data yet", give it a few seconds and refresh. The API ingests data in near-real-time.
</Aside>

---

## Requirements

- Ruby 3.0+

## Install

Add to your `Gemfile`:

```ruby
gem "crontinel", "~> 0.1"
```

Or install directly:

```bash
gem install crontinel
```

## Quick Start

```ruby
require "crontinel"

client = Crontinel.client(api_key: ENV["CRONTINEL_API_KEY"])

result = send_daily_summary
client.task_finished(name: "send-daily-summary", duration_ms: 520)
```

### With error handling

```ruby
client = Crontinel.client(api_key: ENV["CRONTINEL_API_KEY"])

begin
  process_invoices
  client.task_finished(name: "process-invoices", duration_ms: 3200)
rescue => e
  client.task_failed(name: "process-invoices", error: e.message, duration_ms: 150)
  raise
end
```

## Sidekiq integration

```ruby
require "crontinel"

# In your worker
class MyJob
  include Sidekiq::Worker

  def perform(*args)
    start = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    client = Crontinel.client(api_key: ENV["CRONTINEL_API_KEY"])
    do_work(*args)
    client.task_finished(
      name: "MyJob",
      duration_ms: ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - start) * 1000).to_i
    )
  rescue => e
    client.task_failed(
      name: "MyJob",
      error: e.message,
      duration_ms: ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - start) * 1000).to_i
    )
    raise
  end
end
```

## Environment variables

`Crontinel.client` reads `CRONTINEL_API_KEY` and `CRONTINEL_API_URL` (default `https://app.crontinel.com`) when you pass no `api_key:` or `endpoint:`. Arguments win over the environment. With no key anywhere it raises `api_key is required`. This needs 0.1.1 or later.

`task_started` sends nothing: Crontinel records a run when it ends. Call `task_finished` or `task_failed`. (In 0.1.0 `task_started` recorded a finished run, so upgrade or leave it out.)

## What it sends

Each call is a JSON-RPC request to `/api/mcp` (`notify/schedule_run`), not the run receipt at `POST /api/v1/ingest/cron`, so it carries no outcome metrics.

## Rails

For Ruby on Rails applications, send an HTTP check-in from your jobs. See the [check-in recipes](/check-in/recipes/).
