---
title: Status Pages
description: "Historical status-page docs. Customer status pages are out of the current outcome-monitor launch offer."
---

> **Out of the current launch offer.** Crontinel’s launch story is outcome monitoring for background jobs (HTTP receipt + optional Laravel package). Customer status pages, uptime probes, and badges are not sold as part of that offer. This page describes UI that may still exist in the app; do not treat it as a launch promise.

## Why a status page

When something breaks, users often want a single URL. That product surface is separate from outcome monitoring and is not part of the current launch claim.

## How it works

Each status page has a slug. The public page is at:

```
https://app.crontinel.com/status/<slug>
```

Custom domains are not available in the app UI.

## Creating your first status page

Create a status page from the dashboard under **Status Pages → Create**.

## Adding endpoints

A status page lists probed endpoints, not monitors. Add them on the page's **Endpoints** screen. Each endpoint has a name, a URL, and a probe interval. The shortest interval you can set depends on your plan.

## Incidents

Incidents are opened and resolved automatically. When an endpoint fails two probes in a row, Crontinel opens an incident with the status **Investigating**. When the endpoint recovers, the incident is resolved. There is no screen for posting incidents by hand.
