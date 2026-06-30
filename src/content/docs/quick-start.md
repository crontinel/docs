---
title: Quick Start
description: Get Crontinel running in under 5 minutes
---

Choose your stack below and follow the steps. Every quickstart follows the same flow:

<div class="grid cards" markdown>

| Package | What you'll do | Time |
|---|---|---|
| [CLI / Docker →](/sdks/cli/#quickstart) | `brew install` → first ping | ~2 min |
| [Laravel →](/installation/#quickstart) | `composer require` → artisan install → first cron run | ~3 min |
| [Node.js / TypeScript →](/sdks/node/#quickstart) | `npm install` → `npx tsx quickstart.ts` | ~3 min |
| [Python →](/sdks/python/#quickstart) | `pip install` → `python quickstart.py` | ~3 min |
| [Go →](/sdks/go/#quickstart) | `go get` → `go run quickstart.go` | ~3 min |
| [Rust →](/sdks/rust/#quickstart) | `cargo add` → `cargo run` | ~3 min |
| [PHP →](/sdks/php/#quickstart) | `composer require` → `php quickstart.php` | ~3 min |
| [Ruby →](/sdks/ruby/#quickstart) | `gem install` → `ruby quickstart.rb` | ~3 min |
| [Ruby on Rails →](/sdks/rails/#quickstart) | `bundle install` → auto-instrument | ~3 min |
| [.NET →](/sdks/dotnet/#quickstart) | `dotnet add package` → `dotnet run` | ~3 min |

</div>

## Before you start

1. **Sign up** at [app.crontinel.com](https://app.crontinel.com/register) (free tier included).
2. **Create an app** from the dashboard — give it a name (e.g. "my-first-app").
3. **Copy your API key** (`crn_live_...`) from the app settings page.

That's it — on to your package.

## Verify it works

After following your package's quickstart:

1. Go to **app.crontinel.com** → **Apps** → select your app
2. Check the **Cron**, **Queue**, or **Events** sections — data should appear within 30 seconds.
3. If you see your job run with exit codes and duration, you're all set.

No data yet? Make sure `CRONTINEL_API_KEY` is set in the environment where your code runs, and that your app can reach `https://app.crontinel.com` (no firewall blocking).

## Next steps

- Set up [alerts](/alerts/channels/) to get notified when a job fails
- Learn about [monitors](/monitors/cron/) for deeper insight
- Connect your [self-hosted instance](/self-hosting/) to the SaaS
