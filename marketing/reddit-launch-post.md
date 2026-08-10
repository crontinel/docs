# Reddit Launch Post Draft — r/laravel

**Title options:**
- "Show HN: I built a cron and queue monitoring tool specifically for Laravel"
- "I built a Laravel-first cron monitoring tool that actually understands Horizon"

---

Hey r/laravel

I have been working on a cron job monitoring tool built specifically for Laravel. Most generic uptime monitors (UptimeRobot, Better Uptime, etc.) can only check if a URL is up. They have no idea whether your Laravel scheduler actually ran, whether Horizon workers died silently, or whether your queue is backing up.

**The problem I kept hitting:**
After every deploy, I would find out hours later that the scheduler had silently died, or that Horizon workers had stopped processing jobs because of a Redis connection drop. By the time I found out, the damage was done.

**What I built:**

Crontinel is a Composer package you drop into any Laravel app:

```bash
composer require crontinel/laravel
php artisan crontinel:install
CRONTINEL_API_KEY=xxx php artisan schedule:run
```

It pings the Crontinel SaaS (or your self-hosted instance) every time the scheduler runs. If the ping stops, you get an alert via Slack, email, PagerDuty, or webhook.

For Horizon users, it monitors queue depth, failed jobs, and worker liveness directly from the Horizon API.

**What makes it different from generic uptime monitors:**

- No URL to monitor. It uses the scheduler itself as the source of truth.
- Understands Laravel concepts: schedules, queues, Horizon, failed jobs.
- Detects silent failures that HTTP checks will never catch.
- Works with self-hosted or SaaS.

**New today: MCP server**

You can now query your cron health via the MCP protocol. If you use Claude Code or Cursor, you can ask "is my scheduler running?" and get an actual answer from your production data.

```bash
npx @crontinel/mcp-server
```

Currently in public beta. Free tier covers 1 app, 5 monitors, 7-day history.

Links:
- Landing: https://crontinel.com
- GitHub (MIT): https://github.com/crontinel/laravel
- Docs: https://docs.crontinel.com

Would love feedback from the community, especially on whether the install process is clear and if there are features you would want to see.

---
