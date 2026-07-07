# Status Page Operations Runbook

> Operational runbook for Crontinel status pages.
>
> Scope: `status.crontinel.com`, `GET /status`, `GET /status/{slug}`, and the Laravel polling flow behind them.

## Purpose

Use this runbook when:
- deploying changes to the status-page flow
- verifying `status.crontinel.com` after a DNS or app change
- investigating status-page outages or stale data
- rolling back a bad DNS or app deployment

## Source of truth

- Public status page is served by the Laravel app.
- The canonical production target for DNS is `crontinel-production.up.railway.app`.
- The public page should respond with HTTP 200 and cache headers.
- The public app should continue to serve `/status/crontinel` and `/status`.

## Deployment prerequisites

Before shipping a change, confirm:

- the app builds cleanly
- status-page routes exist in `routes/web.php`
- `StatusPageController` still resolves the `crontinel` page
- the Laravel scheduler / polling path is healthy
- Railway deploy completed successfully
- Cloudflare DNS still points `status.crontinel.com` at the Railway app endpoint

## Fast smoke checks

### Public endpoint

```bash
curl -sS -D - https://status.crontinel.com -o /tmp/status.html
```

Verify:
- status line is `HTTP/2 200`
- body renders the Crontinel status page
- `Cache-Control` is present

### Host-based fallback check

If the domain is routed through the app before DNS fully settles, verify the host dispatch locally:

```bash
curl -sS -D - -H 'Host: status.crontinel.com' http://127.0.0.1:8011/
```

Verify:
- status line is `HTTP/1.1 200 OK`
- title is `Crontinel Status`

### Railway HTTP logs

```bash
railway logs --http --lines 20 --latest
```

Use this to confirm:
- `GET /` on `status.crontinel.com` returns 200
- there are no repeated 404s on `/crontinel.com/status`
- the request path is hitting the expected public route

### DNS record check

```bash
set -a; source ~/.openclaw/secrets/ct.env; set +a
python3 - <<'PY'
import os, requests
zone = requests.get(
    'https://api.cloudflare.com/client/v4/zones',
    params={'name': 'crontinel.com', 'per_page': 1},
    headers={'X-Auth-Email': os.environ['CF_LOGIN_EMAIL'], 'X-Auth-Key': os.environ['CF_API_KEY']},
).json()['result'][0]['id']
resp = requests.get(
    f'https://api.cloudflare.com/client/v4/zones/{zone}/dns_records',
    params={'name': 'status.crontinel.com', 'per_page': 20},
    headers={'X-Auth-Email': os.environ['CF_LOGIN_EMAIL'], 'X-Auth-Key': os.environ['CF_API_KEY']},
)
print(resp.text)
PY
```

Verify the `CNAME` content is `crontinel-production.up.railway.app`.

## Known failure modes

### 1) DNS propagation delay

Symptoms:
- Cloudflare record is correct, but users still see the old page
- `curl https://status.crontinel.com` returns cached or stale content

What to do:
- recheck the DNS record in Cloudflare
- wait for propagation
- re-run the smoke check after a few minutes
- confirm the app itself still serves the correct page via the host-based check

### 2) App route regression

Symptoms:
- `status.crontinel.com` returns 404 or a login redirect
- `/crontinel.com/status` shows up in Railway HTTP logs

What to do:
- check `routes/web.php` for host-based dispatch
- verify `StatusPageController::showByDomain()` still resolves `crontinel`
- redeploy the app
- re-run the smoke checks

### 3) Scheduler / polling stopped

Symptoms:
- the page loads, but endpoint statuses are stale
- endpoints remain `unknown` or stop updating

What to do:
- inspect Railway deploy/runtime logs
- confirm `schedule:run` is still active under the app process supervision
- verify database writes are happening
- re-run the polling command manually if needed

### 4) Database lag or outage

Symptoms:
- public page loads, but endpoints are missing or blank
- recent status changes do not appear
- controller logs show DB/connection failures

What to do:
- check Railway database health
- confirm the app can read status-page tables
- verify the latest deploy did not break DB connectivity
- retry after the DB recovers

### 5) Cloudflare credential / API failure

Symptoms:
- DNS updates fail
- API calls return auth errors

What to do:
- confirm `~/.openclaw/secrets/ct.env` is loaded
- verify the current Cloudflare credential is still valid
- if auth is broken, pause DNS work and escalate for a fresh credential path

## Rollback note

If a DNS change causes trouble:

1. Restore the `status.crontinel.com` CNAME to `crontinel-production.up.railway.app`.
2. Re-run the public smoke check.
3. Recheck the Railway HTTP logs for a 200 response.
4. If needed, revert the most recent app deploy and redeploy the last known-good commit.

## Escalation path

Escalate to Harun when:
- the DNS record is correct but the public endpoint still fails
- Cloudflare auth is invalid and blocks record changes
- the app deploy is green but the page still serves 404
- the scheduler is down and cannot be restarted safely

Include in the escalation:
- exact URL
- exact HTTP status
- timestamp
- latest Railway request ID if available
- whether Cloudflare DNS is already pointed at the Railway endpoint

## Minimal operator checklist

- [ ] Check DNS record in Cloudflare
- [ ] Confirm live page returns 200
- [ ] Confirm cache headers
- [ ] Check Railway HTTP logs for the expected path
- [ ] Verify polling / scheduler health
- [ ] Escalate only with exact failure details
