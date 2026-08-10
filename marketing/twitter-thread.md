# Twitter/X Launch Thread Draft

---

Tweet 1 (hook):
Every Laravel deploy, something breaks. Usually it is the cron scheduler dying silently.

I spent weeks building a tool to catch this before users notice.

Introducing Crontinel: cron monitoring built for Laravel.

Tweet 2 (problem):
Generic uptime monitors check if a URL is up. They have no idea if:
- Your scheduler stopped running after a deploy
- Horizon workers died because of a Redis reconnect
- Your queue has been backed up for 3 hours

You find out from users, not from your monitoring.

Tweet 3 (solution):
Crontinel uses the scheduler itself as the source of truth.

`composer require crontinel/laravel`
`php artisan crontinel:install`

Then it pings us every time your scheduler runs. If the ping stops, you get an alert.

For Horizon users: monitors queue depth, failed jobs, worker liveness directly from the Horizon API.

Tweet 4 (demo/install):
Start free. No credit card.

app.crontinel.com

Docs: docs.crontinel.com
GitHub (MIT): github.com/crontinel/laravel

Tweet 5 ( differentiation / open source):
Also released today: an MCP server for your AI coding tools.

Ask your AI terminal if your cron is healthy. It queries your actual production data via the MCP protocol.

`npx @crontinel/mcp-server`

Everything is MIT licensed. Self-host if you want to own your data.
