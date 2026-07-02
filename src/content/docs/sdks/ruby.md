---
title: Ruby
description: Install and configure crontinel for Ruby applications
---

import { Aside } from '@astrojs/starlight/components';

## Quickstart

Get from zero to your first data in under 3 minutes.

### 1. Prerequisites

- Ruby 3.0+
- A Crontinel account ([sign up free](https://app.crontinel.com/register))
- An app created in the dashboard
- Your API key (`crn_live_...`) from app settings

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
export CRONTINEL_API_KEY=crn_live_xxxxxxxxxxxx
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

client.task_started(name: "send-daily-summary")
result = send_daily_summary
client.task_finished(name: "send-daily-summary", duration_ms: 520)
```

### With error handling

```ruby
client = Crontinel.client(api_key: ENV["CRONTINEL_API_KEY"])

begin
  client.task_started(name: "process-invoices")
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

Crontinel.client(api_key: ENV["CRONTINEL_API_KEY"])

# In your worker
class MyJob
  include Sidekiq::Worker

  def perform(*args)
    start = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    do_work(*args)
    Crontinel.client.task_finished(
      name: "MyJob",
      duration_ms: ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - start) * 1000).to_i
    )
  rescue => e
    Crontinel.client.task_failed(
      name: "MyJob",
      error: e.message,
      duration_ms: ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - start) * 1000).to_i
    )
    raise
  end
end
```

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `CRONTINEL_API_KEY` | — | Your Crontinel API key (required) |
| `CRONTINEL_API_URL` | `https://app.crontinel.com/api/v1` | SaaS or self-hosted endpoint |

## Rails

For Ruby on Rails applications, use [`crontinel-rails`](https://github.com/crontinel/ruby-on-rails) instead — it auto-instruments ActiveJob and ActiveScheduler.
