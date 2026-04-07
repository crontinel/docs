---
title: Alert Channels
description: Configuring Slack, email, PagerDuty, and webhook alerts
---

## Available channels

| Channel | Config key | Notes |
|---|---|---|
| Slack | `webhook_url` | Incoming webhook URL |
| Email | `to` | Recipient email address |
| PagerDuty | `routing_key` | Events API v2 routing key |
| Webhook | `url` | Any HTTPS endpoint |

## Configuration

### Slack

Set up an [Incoming Webhook](https://api.slack.com/messaging/webhooks) in your Slack app, then add the channel in the Crontinel dashboard with config key `webhook_url`.

### Email

Add an email channel with config key `to` set to the recipient address. Crontinel sends via Resend — no SMTP setup required on your end.

### PagerDuty

1. In PagerDuty, create a service with the **Events API v2** integration.
2. Copy the **Integration Key** (routing key).
3. Add a PagerDuty channel in the Crontinel dashboard with config key `routing_key`.

Crontinel uses `dedup_key = crontinel:{app_id}:{alert_key}` — so PagerDuty automatically correlates fire and resolve events into a single incident.

### Webhook

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

The same condition won't re-fire for 5 minutes. If a queue stays above its threshold for an hour, you get one alert at the start — not one every poll cycle.

## Auto-resolution

When a condition clears, Crontinel sends a "resolved" notification. You get clear start and end signals for every incident.

## SaaS alert management

In the [Crontinel SaaS](https://app.crontinel.com) you can configure per-app alert channels through the web UI without touching config files.
