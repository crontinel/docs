# Stripe Price ID Verification — 2026-06-29

## Result: ❌ All 6 price IDs in config were invalid

Every configured Stripe price ID in `cashier.php`, `plans.php`, and `.env` pointed to
**nonexistent prices** (returned `null` from Stripe API). Stripe prices were
recreated at some point, generating new IDs, but the config was never updated.

## Fix Applied

### Current Stripe prices (verified via Stripe API)

| Plan | Interval | Correct Price ID | Amount | Product |
|---|---|---|---|---|
| Starter | monthly | `price_1TVriWHOM21T1vfs4iWd1Wil` | $9.99 | prod_UUrRpYX2YiLXWb |
| Starter | yearly | `price_1TVriXHOM21T1vfsSlGiziIg` | $99.90 | prod_UUrRpYX2YiLXWb |
| Pro | monthly | `price_1TVriYHOM21T1vfsRwxtxkqC` | $19.99 | prod_UOSUH6wAicKgyk |
| Pro | yearly | `price_1TVriZHOM21T1vfsXTEJSBuT` | $199.90 | prod_UOSUH6wAicKgyk |
| Ultra | monthly | `price_1TVriaHOM21T1vfssekDRuxeW` | $49.99 | prod_UOSUq6WG5ln3U1 |
| Ultra | yearly | `price_1TVribHOM21T1vfsPEIP50Bw` | $499.90 | prod_UOSUq6WG5ln3U1 |

### Legacy prices (also added to paid_prices for existing subscribers)

| Plan | Interval | Legacy Price ID | Amount |
|---|---|---|---|
| Pro | monthly | `price_1TPfZGHOM21T1vfsh5JBKQCC` | $19.00 |
| Pro | yearly | `price_1TPfZHHOM21T1vfsKzZOJ9n2` | $182.00 |
| Ultra | monthly | `price_1TPfZIHOM21T1vfsAdjPw1GE` | $49.00 |
| Ultra | yearly | `price_1TPfZIHOM21T1vfsSESA9vMB` | $470.00 |

### Files modified locally

1. **`app/config/cashier.php`** — `paid_prices` map: replaced all 6 invalid IDs
   with 10 correct IDs (6 current + 4 legacy)
2. **`app/config/plans.php`** — Starter plan: hardcoded invalid IDs replaced with
   `env()` calls (matching Pro/Ultra pattern), with correct defaults
3. **`app/.env`** — All 6 `STRIPE_*_PRICE_*` vars updated to correct IDs

### Still needed

- **Railway production env vars**: Need to update `STRIPE_*_PRICE_*` secrets
  in Railway dashboard to match. Railway OAuth token is expired.
