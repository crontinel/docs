---
title: Status Pages
description: "Historical status-page docs. Customer status pages are out of the current outcome-monitor launch offer."
---

> **Out of the current launch offer.** Crontinel’s launch story is outcome monitoring for background jobs (HTTP receipt + optional Laravel package). Customer status pages, uptime probes, and badges are not sold as part of that offer. This page describes UI that may still exist in the app; do not treat it as a launch promise.

## Why a status page

When something breaks, users often want a single URL. That product surface is separate from outcome monitoring and is not part of the current launch claim.

## How it works

Your status page is served from your own domain via CNAME. Users visit `status.yourdomain.com` and see your status page, while the URL stays `status.yourdomain.com` in their browser.

## Creating your first status page

Create a status page from the dashboard under **Status Pages → Create**. Each page gets:

- A unique domain identifier (your main domain, e.g. `yourdomain.com`)
- A CNAME target to add to your DNS

## Setting up your CNAME

After creating a status page, you'll see a CNAME target: `app.crontinel.com`.

Add this DNS record to your domain:

| Type | Name | Target |
|------|------|--------|
| CNAME | `status` | `app.crontinel.com` |

Once added, your status page will be live at `status.yourdomain.com`.

It can take a few minutes for DNS to propagate.

## Your status page URL

After setup, your status page is available at:

```
https://status.yourdomain.com
```

Where `yourdomain.com` is the domain you specified when creating the page.

## Adding monitors

From **Status Pages → Edit**, select which monitors appear on the page. Each monitor shows as a row with:

- Current status indicator
- Response time
- Last checked time

Only the monitors you choose are visible. Internal or sensitive checks stay private.

## Incident management

Post incidents manually from **Status Pages → Incidents → New Incident**. Each incident moves through four stages:

1. **Investigating** – you're aware and looking into it
2. **Identified** – root cause found
3. **Monitoring** – fix deployed, watching for recurrence
4. **Resolved** – back to normal

Updates appear on the status page in reverse chronological order.

## Custom domains

Custom domains may exist in the app UI. They are not a Starter/Pro/Max launch entitlement. Status pages remain out of the current offer.
