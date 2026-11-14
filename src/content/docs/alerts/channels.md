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
| Discord | `webhook_url` | Discord webhook URL |
| Microsoft Teams | `webhook_url` | Teams webhook URL |
| Telegram | `bot_token`, `chat_id` | Bot token and chat ID |
| PagerDuty | `routing_key` | Paid plans only |
| SMS | `phone_number` | Paid plans only. E.164 format, such as `+15551234567` |
| OpsGenie | `api_key` | Paid plans only |

SMS has a monthly quota per organization: Free 0, Starter 20, Pro 100, Max 500. Messages over the quota are not sent.

The Laravel package's local alerting supports only `mail`, `slack`, and `webhook`.

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
CRONTINEL_ALERT_CHANNEL=mail  # Required environment variable
CRONTINEL_ALERT_EMAIL=you@example.com  # Required environment variable
```

Add an email channel with config key `to` set to the recipient address. Crontinel sends via Resend  –  no SMTP setup required on your end.

### Webhook

**OSS: configure via environment variables**

In your `.env`:
```env
CRONTINEL_ALERT_CHANNEL=webhook  # Required environment variable
CRONTINEL_WEBHOOK_URL=https://your-endpoint.example.com/crontinel  # Required environment variable
```

The package sends a POST with:

```json
{
  "title": "Queue [default] alert",
  "message": "...",
  "level": "warning",
  "resolved": false,
  "fired_at": "2026-04-07T08:00:00+00:00",
  "source": "crontinel"
}
```

`level` is `critical`, `warning`, or `resolved`. To send extra headers, such as an auth token, set `CRONTINEL_WEBHOOK_HEADERS` to a JSON object, for example `{"Authorization": "Bearer your-token"}`.

In the dashboard, add a webhook channel with config key `url`. Crontinel sends a POST with:

```json
{
  "app": "my-app",
  "alert_key": "queue:default:depth",
  "message": "Queue 'default' depth is 1500 (threshold: 1000)",
  "state": "firing",
  "fired_at": "2026-04-07T08:00:00Z"
}
```

The hosted payload also includes `delivery_id`, `dashboard_url`, `run_id`, `command`, `status`, and `context`, and sends the delivery ID in the `X-Crontinel-Delivery-Id` header.

## Alert deduplication

In the hosted app, an alert that stays active re-fires once per cooldown, not on every check. The default cooldown is 5 minutes. Set it per app from 1 to 60 minutes. Missed-run, never-finished, and agent schedule alerts use a fixed 15 minutes.

In the Laravel package, an active condition re-fires every 5 minutes while `crontinel:check` keeps finding it.

## Auto-resolution

When a condition clears, Crontinel sends a "resolved" notification. You get clear start and end signals for every incident.

## Muting alerts (SaaS)

Mute alerts for 1 hour, 4 hours, 24 hours, or 7 days, or unmute early. Only people who can configure the app can mute.

- **Whole app:** use the mute control in the app header.
- **One monitor:** use the mute control on a cron, heartbeat, HTTP, cron schedule, or agent row. A muted cron schedule also mutes run alerts for its command.

While muted, Crontinel still records incidents and state. Only the notification is held back. An app mute wins over monitor settings. Test sends still go out. The mute ends by itself, and each mute and unmute is in the audit log.

## Maintenance windows (SaaS)

Plan quiet time ahead instead of muting by hand. Add windows on the app's **Settings** tab, under **Maintenance windows**. You need configure access to the app.

- **Once:** a start and end date and time.
- **Weekly:** the days, a start time and a duration (5 minutes to 7 days). Times use the app's time zone, or UTC if it has none, and follow daylight saving changes. A Sunday 09:00 window stays at 09:00 local time all year.
- **Scope:** the whole app, or only the monitors you pick, or only monitors with the tags you list. With no monitors and no tags, the window covers the whole app. A cron schedule in scope also covers run alerts for its command.

During a window:

- Alerts in scope send no notifications and no escalation steps. Escalation steps are not used up.
- Incidents are still recorded. Open alerts show **During maintenance**.
- A cron schedule occurrence due inside the window does not raise a "never started" alert, even after the window ends.
- The app header shows **In maintenance until** the window's end, with **(selected monitors)** when the window has a scope.

When a window ends, an incident in scope that is still open and unacknowledged gets one normal notification, and escalation starts its wait again from that point. An incident that recovered during the window sends nothing.

Each add, edit and delete is in the audit log. You can also manage windows with the [Configuration API](/reference/config-api/#maintenance-windows). Status page maintenance windows are separate and do not affect alerts.

## Acknowledging alerts (SaaS)

Acknowledge an open alert to say someone is on it. It stops escalation for that incident only.

- **Dashboard:** the app's Monitors tab lists open alerts. Click **Acknowledge**. You need configure access to the app.
- **Email and Slack:** firing alerts include an **Acknowledge this alert** link. It works without signing in, covers that one incident, and expires after 24 hours. The link opens a confirm page; nothing changes until you press **Acknowledge**.

Each open alert shows who acknowledged it and when. Every acknowledgement is in the audit log, with the user or the channel link as the actor. The recovery notification still goes to every channel that was notified. If the alert fires again after it recovered, that is a new incident and starts unacknowledged.

## Escalation (SaaS)

Set an escalation policy per app on the app's **Settings** tab, under **Escalation**. A policy has up to 5 steps. Each step waits 5 to 1440 minutes after the previous step, then notifies the channels you pick.

- The first notification goes out as it always does. Channels you pick in a step are held back until that step, so a PagerDuty or SMS channel can wait for step 1.
- Escalation stops when someone acknowledges the alert or the alert recovers.
- Only alerts that open after you first add a policy escalate. Alerts already open at that time do not. Editing the policy later does not change this.
- Each step sends once per incident. Escalation messages start with `Escalation step N, not acknowledged:`.
- A muted app or a [maintenance window](#maintenance-windows-saas) holds escalation back. The step is not used up; it sends once the mute or window ends if the alert is still open and unacknowledged.
- Recovery notifies every channel the incident reached, including escalation channels.

Open alerts show **Escalated to step N** once a step has gone out. You can also read and replace the policy with the [Configuration API](/reference/config-api/#escalation-policy).

## SaaS alert management

In the [Crontinel SaaS](https://app.crontinel.com) you can configure per-app alert channels through the web UI without touching config files.
