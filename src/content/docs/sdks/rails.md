---
title: Ruby on Rails
description: Auto-instrument ActiveJob and ActiveScheduler with crontinel-rails
---

## Requirements

- Ruby 3.0+
- Rails 6.1+

## Install

Add to your `Gemfile`:

```ruby
gem "crontinel", "~> 0.1"
gem "crontinel-rails", "~> 0.1"
```

```bash
bundle install
```

## Configuration

Create `config/initializers/crontinel.rb`:

```ruby
Crontinel.setup do |config|
  config.api_key = ENV.fetch("CRONTINEL_API_KEY")
end
```

Set the environment variable:

```bash
# .env
CRONTINEL_API_KEY=crn_live_...
```

## ActiveJob integration

Automatically tracks all `ActiveJob.perform_later` jobs:

```ruby
class MyJob < ApplicationJob
  include Crontinel::Rails::ActiveJob

  def perform(*args)
    # your job work — auto-reported
  end
end
```

The module wraps `around_perform` automatically. No other changes needed.

## ActiveScheduler integration

Automatically tracks jobs scheduled with [ActiveScheduler](https://github.com/rails-engine/active_scheduler):

```ruby
# config/initializers/crontinel.rb
Rails.application.config.active_scheduler do |scheduler|
  scheduler.include Crontinel::Rails::ActiveScheduler
end
```

## Sidekiq server middleware

```ruby
# lib/crontinel_rails.rb
require "crontinel/rails/sidekiq/server_middleware"

Sidekiq.configure_server do |config|
  config.server_middleware do |chain|
    chain.add Crontinel::Rails::Sidekiq::ServerMiddleware
  end
end
```

## Rake tasks

```ruby
# lib/tasks/reports.rake
namespace :reports do
  task daily: :environment do
    crontinel = Crontinel.client(api_key: ENV["CRONTINEL_API_KEY"])

    crontinel.task_started(name: "reports:daily")
    begin
      GenerateDailyReport.call
      crontinel.task_finished(name: "reports:daily", duration_ms: 0)
    rescue => e
      crontinel.task_failed(name: "reports:daily", error: e.message, duration_ms: 0)
      raise
    end
  end
end
```

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `CRONTINEL_API_KEY` | — | Your Crontinel API key (required) |
| `CRONTINEL_ENDPOINT` | `https://app.crontinel.com/api/v1` | SaaS or self-hosted endpoint |
