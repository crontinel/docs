---
title: CLI Health Check
description: Using php artisan crontinel:check in CI and monitoring pipelines
---

```bash
php artisan crontinel:check
```

Prints a table of all monitor statuses and exits:
- `0`  –  all monitors healthy
- `1`  –  one or more alerts active

## JSON output

```bash
php artisan crontinel:check --format=json
```

Returns:

```json
{
  "status": "healthy",
  "horizon": {"status": "running", "paused": false},
  "queues": [{"name": "default", "depth": 5, "status": "ok"}],
  "crons": [{"command": "inspire", "last_exit_code": 0, "status": "ok"}],
  "alerts": []
}
```

## CI/CD usage

```yaml
# GitHub Actions
- name: Check job health
  run: php artisan crontinel:check --format=json
```

```bash
# Deploy script
php artisan crontinel:check || echo "Warning: monitors unhealthy after deploy"
```

## No-alert mode

Run the check without firing alerts (useful for health endpoints):

```bash
php artisan crontinel:check --no-alerts
```
