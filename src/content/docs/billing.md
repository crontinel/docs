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

AI quality grades have their own monthly allowance: Free 50, Starter 500, Pro 2,000, Max 5,000. Each graded run uses one, even when the grade fails. See [AI agent jobs](/mcp/ai-agent-monitoring/#grade-allowance).

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

Manage billing from the [Billing page](https://app.crontinel.com/team/billing) in the dashboard. Only the organization owner can change the plan or payment details.

- **Upgrades take effect now.** Moving to a higher plan, or from monthly to yearly billing, charges right away. You pay for the new plan, minus credit for the unused time on the old one. Monthly to yearly also moves your billing date to today.
- **Downgrades wait for the renewal.** A lower plan, or yearly to monthly, starts at the end of the current period. No refund or negative balance is issued.
- **Cancel anytime.** The subscription stays active until the end of the current period, then Free allowances apply.

If your bank asks to confirm an upgrade payment (3D Secure), it can't be charged automatically. Contact support@crontinel.com and we will switch the plan.

## Payment method and failed payments

**Update payment method** on the Billing page opens Stripe's secure page, where you can change the card and download invoices.

If a renewal payment fails:

1. The owner gets an email, and the dashboard and Billing page show that the payment is past due.
2. Stripe retries the card several times. Update the card and pay the open invoice from the Billing page to keep your plan.
3. If every retry fails, the subscription ends and the organization moves to Free. The owner gets one more email.

## OSS

`crontinel/laravel` is MIT licensed. Self-hosted local dashboards are not a substitute for hosted detection when the same host dies. See [Self-Hosting](/self-hosting/).
