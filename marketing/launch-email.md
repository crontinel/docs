# Launch Announcement Email — Waitlist

**Subject:** Crontinel is live. Cron monitoring for Laravel is here.

---

Hey

You signed up for the Crontinel waitlist a while back. Good news: we are officially live.

**What is Crontinel?**

It is a cron job and queue monitoring tool built specifically for Laravel. Most generic uptime monitors check if a URL returns 200. Crontinel checks if your scheduler actually ran, whether your Horizon workers are still alive, and whether your queue is backed up.

The problem it solves: you find out about cron failures hours later, after users have already been impacted. Crontinel alerts you in minutes, via Slack, email, PagerDuty, or webhook.

**How to get started:**

1. Go to https://app.crontinel.com and create your free account
2. Install the Composer package: `composer require crontinel/laravel`
3. Run `php artisan crontinel:install`
4. Add your API key to `.env`

Free plan covers 1 app, 5 monitors, 7-day history. No credit card required.

**New: MCP server**

If you use Claude Code or Cursor, you can now query your cron health directly from the AI terminal. Just run:

```
npx @crontinel/mcp-server
```

Docs: https://docs.crontinel.com
GitHub (MIT licensed, self-host for free): https://github.com/crontinel/laravel

Would love to hear what you think. Reply to this email or ping me on Twitter/X.

Harun
