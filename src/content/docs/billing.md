---
title: Billing & Plans
description: What each Crontinel plan includes, free tier limits, and how to upgrade
---

Crontinel offers three plans. The OSS package is always free to use locally without any account.

## Plans

| | Free | Pro | Team |
|---|---|---|---|
| **Apps** | 1 | 5 | Unlimited |
| **History** | 7 days | 90 days | 365 days |
| **Team members** | 1 | 3 | Unlimited |
| **Alert channels** | — | ✅ | ✅ |
| **Price** | $0 | $19/mo | $49/mo |

Annual billing saves ~20%: Pro at $182/yr, Team at $470/yr.

## Free plan

The Free plan is a permanent free tier — not a trial. It includes:

- 1 monitored app
- 7-day cron run and queue history
- 1 team member (you)
- Dashboard access with live monitoring

Alert channels (Slack, email, webhook) require Pro or higher.

## Pro plan

For individuals and small teams running multiple production apps:

- Up to 5 apps
- 90-day history for cron runs, queue depths, and Horizon status
- Up to 3 team members
- Alert channels: Slack, email, webhook
- All current and future alert types

## Team plan

For larger teams or teams with many apps:

- Unlimited apps
- 365-day history
- Unlimited team members
- All alert channels
- Priority support

## Upgrading

Upgrade from the [Billing page](https://app.crontinel.com/team/billing) in the dashboard. Upgrades take effect immediately with prorated billing. Downgrades apply at the end of the current billing period.

For full pricing details, discounts, and annual plans, see the [pricing page](https://crontinel.com/pricing).

## Cancelling

Cancel anytime from the Billing page. Your subscription stays active until the end of the current billing period, then reverts to the Free plan. Your data is retained for 30 days after downgrade.

## OSS and self-hosting

The `crontinel/laravel` package is MIT licensed and always free to use. The self-hosted dashboard app (`crontinel/app`) requires a Pro or Team subscription for repository access. See [Self-Hosting](/self-hosting) for details.
