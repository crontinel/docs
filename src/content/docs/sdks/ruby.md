---
title: Ruby
description: Install and configure crontinel for Ruby applications
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
# config/initializers/crontinel.rb
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
