---
title: Alert Channels
description: Send Crontinel alerts to Slack, email, or a webhook when a cron run fails, a queue climbs, or a Horizon supervisor stops.
---

Channels work the same for every runtime. Add them in the Crontinel dashboard: a curl, Node, Python, Sidekiq, or GitHub Actions job gets the same alert on a failed outcome, a run that never starts, or a run that never finishes. The environment variables further down configure the Laravel package's local alerting only.

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

## Muting alerts (SaaS)

Mute alerts for 1 hour, 4 hours, 24 hours, or 7 days, or unmute early. Only people who can configure the app can mute.

- **Whole app:** use the mute control in the app header.
- **One monitor:** use the mute control on a cron, heartbeat, HTTP, cron schedule, or agent row. A muted cron schedule also mutes run alerts for its command.

While muted, Crontinel still records incidents and state. Only the notification is held back. An app mute wins over monitor settings. Test sends still go out. The mute ends by itself, and each mute and unmute is in the audit log.

## Acknowledging alerts (SaaS)

Acknowledge an open alert to say someone is on it. It stops escalation for that incident only.

- **Dashboard:** the app's Monitors tab lists open alerts. Click **Acknowledge**. You need configure access to the app.
- **Email and Slack:** firing alerts include an **Acknowledge this alert** link. It works without signing in, covers that one incident, and expires after 24 hours. The link opens a confirm page; nothing changes until you press **Acknowledge**.

Each open alert shows who acknowledged it and when. Every acknowledgement is in the audit log, with the user or the channel link as the actor. The recovery notification still goes to every channel that was notified. If the alert fires again after it recovered, that is a new incident and starts unacknowledged.

## Escalation (SaaS)

Set an escalation policy per app on the app's **Settings** tab, under **Escalation**. A policy has up to 5 steps. Each step waits 5 to 1440 minutes after the previous step, then notifies the channels you pick.

- The first notification goes out as it always does. Channels you pick in a step are held back until that step, so a PagerDuty or SMS channel can wait for step 1.
- Escalation stops when someone acknowledges the alert or the alert recovers.
- Each step sends once per incident. Escalation messages start with `Escalation step N, not acknowledged:`.
- A muted app holds escalation back. The step is not used up; it sends once the mute ends if the alert is still open and unacknowledged.
- Recovery notifies every channel the incident reached, including escalation channels.

Open alerts show **Escalated to step N** once a step has gone out. You can also read and replace the policy with the [Configuration API](/reference/config-api/#escalation-policy).

## SaaS alert management

In the [Crontinel SaaS](https://app.crontinel.com) you can configure per-app alert channels through the web UI without touching config files.

## Future alert channels

The following channels are on the roadmap but not yet available:

- **PagerDuty** — IT alert routing and incident management. Planned for a future release.
- **SMS** — Direct text message alerts. Sign up for early access at [crontinel.com](https://crontinel.com/) when this launches.
- **OpsGenie** — IT alert routing and on-call management. Planned for a future release.
- **VictorOps** — Incident management and PagerDuty alternative. Planned for a future release.
