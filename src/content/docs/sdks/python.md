---
title: Python
description: The crontinel package (0.2.1+) on PyPI records runs from Python. For outcome metrics, send the HTTP check-in receipt.
---

The `crontinel` package records that a job ran, how long it took and its exit code. It does not send outcome metrics, so it cannot catch a job that finished but did nothing. For that, send the [HTTP check-in receipt](/check-in/recipes/) with a count from inside the job; `outcome_checkin.py` there needs only the standard library and has wrappers for APScheduler and Celery.

Use 0.2.1 or later. It has no required dependencies: without `requests` installed it uses the standard library.

## Install

```bash
pip install crontinel
```

## Quickstart

```python
from crontinel import Crontinel

client = Crontinel()  # reads CRONTINEL_API_KEY, and CRONTINEL_API_URL if set

client.schedule_run("hello-from-python", duration_ms=100, exit_code=0)
```

Use your app's ingest key. `hello-from-python` then shows on the dashboard as a completed run.

To time a function and report it, including a failure if it raises:

```python
result, duration_ms, exit_code = client.monitor_schedule("reports:build", build_reports)
```

`monitor_schedule` re-raises your function's exception, and never fails your job if reporting fails.

## Options

```python
client = Crontinel(
    api_key="...",                 # or CRONTINEL_API_KEY
    api_url="https://app.crontinel.com",  # or CRONTINEL_API_URL
    app_name="my-worker",
)
```

Arguments win over the environment variables.

## What it sends

Each call is a JSON-RPC request to `/api/mcp` (for example `notify/schedule_run`), not the run receipt at `POST /api/v1/ingest/cron`. A rejected call raises an HTTP error (or `RuntimeError` for an RPC error) from `schedule_run`, `queue_processed` and `event`.

With an outcome rule set on the job, these runs show as "unknown (no evidence)", because the package sends no metrics. Use the HTTP receipt for jobs with a minimum.
