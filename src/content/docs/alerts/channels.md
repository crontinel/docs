---
title: Alert Channels
description: Send Crontinel alerts to Slack, email, or a webhook when a cron run fails, a queue climbs, or a Horizon supervisor stops.
---

## Available channels

| Channel | Config key | Notes |
|---|---|---|
| Slack | `webhook_url` | Incoming webhook URL |
| Email | `to` | Recipient email address |
| Webhook | `url` | Any HTTPS endpoint |
| PagerDuty | — | Coming soon |
| SMS | — | Coming soon |
| OpsGenie | — | Future roadmap |
| VictorOps | — | Future roadmap |

## Configuration

### Slack

**OSS: configure via environment variables**

In your `.env`:
```env
CRONTINEL_ALERT_CHANNEL=slack  # Required environment variable
CRONTINEL_SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL  # Required environment variable
```

Or directly in `config/crontinel.php` under the `alerts` key.

Set up an [Incoming Webhook](https://api.slack.com/messaging/webhooks) in your Slack app, then add the channel in the Crontinel dashboard with config key `webhook_url`.

### Email

**OSS: configure via environment variables**

In your `.env`:
```env
CRONTINEL_ALERT_CHANNEL=email  # Required environment variable
CRONTINEL_ALERT_EMAIL=you@example.com  # Required environment variable
```

Add an email channel with config key `to` set to the recipient address. Crontinel sends via Resend  –  no SMTP setup required on your end.

### PagerDuty (coming soon)

> **Note:** PagerDuty integration is planned and will be available in a future release.

### Webhook

**OSS: configure via environment variables**

In your `.env`:
```env
CRONTINEL_ALERT_CHANNEL=webhook  # Required environment variable
CRONTINEL_WEBHOOK_URL=https://your-endpoint.example.com/crontinel  # Required environment variable
```

Add a webhook channel with config key `url`. Crontinel sends a POST with:

```json
{
  "app": "my-app",
  "alert_key": "queue:default:depth",
  "message": "Queue 'default' depth is 1500 (threshold: 1000)",
  "state": "firing",
  "fired_at": "2026-04-07T08:00:00Z"
}
```

## Alert deduplication

The same condition won't re-fire for 5 minutes. If a queue stays above its threshold for an hour, you get one alert at the start  –  not one every poll cycle.

## Auto-resolution

When a condition clears, Crontinel sends a "resolved" notification. You get clear start and end signals for every incident.

## SaaS alert management

In the [Crontinel SaaS](https://app.crontinel.com) you can configure per-app alert channels through the web UI without touching config files.

## Future alert channels

The following channels are on the roadmap but not yet available:

- **PagerDuty** — IT alert routing and incident management. Planned for a future release.
- **SMS** — Direct text message alerts. Sign up for early access at [crontinel.com](/) when this launches.
- **OpsGenie** — IT alert routing and on-call management. Planned for a future release.
- **VictorOps** — Incident management and PagerDuty alternative. Planned for a future release.
