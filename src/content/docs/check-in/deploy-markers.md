---
title: Deploy markers
description: Tell Crontinel when you deploy. Markers show on the analytics trend, between runs in run history, next to open alerts, and in incident evidence.
---

Send one request from your deploy pipeline and Crontinel records a deploy marker. When a job starts failing, you can see whether a release went out just before it.

Markers show up in four places:

- **Analytics.** A purple vertical line on each day of the daily trend that had a deploy.
- **Run history.** A deploy row between the runs before and after it.
- **Open alerts.** "Last deploy before this: `v2.4.0 (production)` (40 minutes earlier)" under each open alert.
- **Incident evidence.** AI investigations and the MCP `get_incident_evidence` tool get up to 3 deploys from the 24 hours before the incident. They get the version, environment, commit SHA, and time, never the description or URL. A deploy near an incident is timing only. It does not prove the deploy caused it.

## Send a deploy

Use the app **ingest key** (`CRONTINEL_INGEST_KEY`), the same key as [run receipts](/check-in/recipes/).

```bash
curl -fsS -m 10 --retry 3 -X POST "https://app.crontinel.com/api/v1/ingest/deploy" \
  -H "Authorization: Bearer $CRONTINEL_INGEST_KEY" \
  -H "Content-Type: application/json" \
  -d '{"version":"v2.4.0","environment":"production","commit_sha":"9fceb02d0ae598e95dc970b74767f19372d61af8"}'
```

| Field | Required | Notes |
|---|---|---|
| `version` | yes | Release name, tag, or build number. Up to 100 characters. |
| `environment` | no | For example `production` or `staging`. Up to 100 characters. |
| `commit_sha` | no | Hex, 4 to 64 characters. |
| `deployed_at` | no | ISO 8601. Defaults to now. Must not be more than five minutes in the future. |
| `url` | no | `https://` only, for example the CI run or release page. |
| `description` | no | Up to 500 characters. Shown in run history. |

The first request for a version returns `201` with `"created": true`. Sending the same version for the same environment again returns `200` with `"created": false` and the same `deploy_id`. The stored marker stays as it was, so retries are safe. The same version in two environments makes two markers.

Each request counts against the monthly ingest allowance like any other receipt. When it runs out you get the same [typed `429`](/reference/api/#ingest-endpoints) with `Retry-After`.

## GitHub Actions

Add a step after your deploy step. Store `CRONTINEL_INGEST_KEY` as a repository secret. `|| true` keeps a monitoring hiccup from failing the deploy.

```yaml
- name: Record deploy in Crontinel
  if: success()
  env:
    CRONTINEL_INGEST_KEY: ${{ secrets.CRONTINEL_INGEST_KEY }}
  run: |
    curl -fsS -m 10 --retry 3 -X POST "https://app.crontinel.com/api/v1/ingest/deploy" \
      -H "Authorization: Bearer $CRONTINEL_INGEST_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"version\":\"${{ github.ref_name }}-${{ github.run_number }}\",\"environment\":\"production\",\"commit_sha\":\"${{ github.sha }}\",\"url\":\"${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}\"}" \
      || true
```

Re-running the workflow reuses `github.run_number`, so a re-run lands on the same marker.

## Read deploys back

- REST: `GET /api/v1/apps/{slug}/deploys` returns the 50 most recent markers, newest first. Add `?environment=production` to filter. See the [REST API](/reference/api/#get-appsslugdeploys).
- MCP: `list_deploys` (needs `run:read`) lists markers for an app. Values come from your pipeline, so assistants treat them as untrusted data.
