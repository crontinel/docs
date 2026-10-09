---
title: Billing & Plans
description: "Starter, Pro, and Max prices and monthly ingest / AI allowances. Email alerts are included; Slack and webhooks stay off the sold card until verified."
---

Paid plans are **Starter**, **Pro**, and **Max**. Free remains the $0 plan. The old Free/Pro/Team capacity table is retired. The Laravel package is MIT and free to use locally without an account.

Owner-selected prices (matching Stripe test-mode prices; not a production checkout acceptance claim):

| Plan | Monthly | Annual | Internal key |
|---|---:|---:|---|
| Free | $0 | — | `free` |
| Starter | $9.99 | $99.90 | `starter` |
| Pro | $19.99 | $199.90 | `pro` |
| Max | $49.99 | $499.90 | `team` |

Annual totals are about two months free against monthly billing. Prefer monthly until annual billing is verified. There is no forever-price promise and no contractual response SLA.

## Monthly allowances

Approved organization allowances (enforcement and hosted cost acceptance are separate gates):

| Plan | Accepted ingest requests | Submitted JSON body bytes | Hosted AI starts |
|---|---:|---:|---:|
| Free | 20,000 | 64 MiB | 5 |
| Starter | 100,000 | 256 MiB | 20 |
| Pro | 500,000 | 1 GiB | 50 |
| Max | 2,000,000 | 4 GiB | 100 |

Allowances reset at 00:00 UTC on the first day of the month. Bytes are submitted request body size, not retained storage. There is no overage charge. A rejected ingest returns a typed 429. Ordinary MCP reads from your own assistant do not spend hosted AI starts.

## Included on every tier

- OAuth-default MCP and generated scoped API keys
- Outcome rules (numeric minimum and artifact freshness). Missing evidence is not healthy.
- Deterministic **email** alerts for failure and recovery, including an incorrect business result, whether or not a model is available

## Not on the sold card yet

- Slack, customer webhooks, SMS, or on-call as a paid channel until each passes the same delivery test as email
- Monitor / app / member caps or retention days copied from the retired Free/Pro/Team proposal
- Customer status pages, uptime probes, or badges as part of this offer

See the [pricing page](https://crontinel.com/pricing/) on the marketing site for what is published today. Workspace contract: `PRICING.md` in the Crontinel workspace.

## Upgrading and cancelling

Manage billing from the [Billing page](https://app.crontinel.com/team/billing) in the dashboard. Cancel anytime; the subscription stays active until the end of the current period, then Free allowances apply.

## OSS

`crontinel/laravel` is MIT licensed. Self-hosted local dashboards are not a substitute for hosted detection when the same host dies. See [Self-Hosting](/self-hosting/).
