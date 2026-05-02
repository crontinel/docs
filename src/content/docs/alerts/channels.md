---
title: Alert Channels
description: Configuring Slack, email, PagerDuty, and webhook alerts
---

## Available channels

| Channel | Config key | Notes |
|---|---|---|
| Slack | `webhook_url` | Incoming webhook URL |
| Email | `to` | Recipient email address |
| PagerDuty | `routing_key` | Events API v2 routing key (coming soon) |
| Webhook | `url` | Any HTTPS endpoint |
| SMS | — | Coming soon |
| OpsGenie | — | Future roadmap |
| VictorOps | — | Future roadmap |

## Configuration

### Slack

**`.env` (self-hosted / OSS)**

```env
CRONTINEL_ALERT_CHANNEL=slack
CRONTINEL_SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**`config/crontinel.php`**

```php
'alerts' => [
    'channel' => 'slack',
    'slack' => [
        'webhook_url' => env('CRONTINEL_SLACK_WEBHOOK'),
    ],
],
```

Set up an [Incoming Webhook](https://api.slack.com/messaging/webhooks) in your Slack workspace, then paste the URL into the env var above.

**SaaS:** add the channel through the Crontinel dashboard with config key `webhook_url`.

---

### Email

**`.env` (self-hosted / OSS)**

```env
CRONTINEL_ALERT_CHANNEL=email
CRONTINEL_ALERT_EMAIL=you@example.com
```

**`config/crontinel.php`**

```php
'alerts' => [
    'channel' => 'email',
    'mail' => [
        'to' => env('CRONTINEL_ALERT_EMAIL'),
    ],
],
```

Uses your app's configured mail driver (`MAIL_MAILER`). Works with SMTP, Resend, Mailgun, or any Laravel-compatible driver.

**SaaS:** add an email channel in the dashboard with config key `to` set to the recipient address.

---

### Webhook

**`.env` (self-hosted / OSS)**

```env
CRONTINEL_ALERT_CHANNEL=webhook
CRONTINEL_WEBHOOK_URL=https://your-endpoint.example.com/crontinel
```

**`config/crontinel.php`**

```php
'alerts' => [
    'channel' => 'webhook',
    'webhook' => [
        'url'     => env('CRONTINEL_WEBHOOK_URL'),
        'headers' => env('CRONTINEL_WEBHOOK_HEADERS'),  // optional JSON object
        'timeout' => env('CRONTINEL_WEBHOOK_TIMEOUT', 10),
    ],
],
```

Crontinel sends a POST with a JSON body:

```json
{
  "app": "my-app",
  "alert_key": "queue:default:depth",
  "message": "Queue 'default' depth is 1500 (threshold: 1000)",
  "state": "firing",
  "fired_at": "2026-04-07T08:00:00Z"
}
```

**SaaS:** add a webhook channel in the dashboard with config key `url`.

---

### PagerDuty (coming soon)

> **Note:** PagerDuty integration is planned and will be available in a future release.

---

## Alert deduplication

The same condition won't re-fire for 5 minutes. If a queue stays above its threshold for an hour, you get one alert at the start — not one every poll cycle.

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
