---
title: Python
description: Install and configure crontinel for Python applications
---

import { Aside } from '@astrojs/starlight/components';

## Quickstart

Get from zero to your first data in under 3 minutes.

### 1. Prerequisites

- Python 3.9+
- A Crontinel account ([sign up free](https://app.crontinel.com/register))
- An app created in the dashboard
- Your API key (`crn_live_...`) from app settings

### 2. Install

```bash
pip install crontinel
```

For async support with httpx:

```bash
pip install "crontinel[httpx]"
```

### 3. Configure

Create a `quickstart.py` file:

```python
from crontinel import Crontinel
import os

client = Crontinel(
    api_key=os.environ["CRONTINEL_API_KEY"],
    app_name="my-first-app",
)

# Report a cron job run
client.schedule_run(
    command="hello-from-python",
    duration_ms=100,
    exit_code=0,
)

print("Data sent to Crontinel!")
```

Set your API key and run it:

```bash
export CRONTINEL_API_KEY=crn_live_xxxxxxxxxxxx
python quickstart.py
```

### 4. Dashboard verification

1. Go to [app.crontinel.com](https://app.crontinel.com) → **Apps** → your app
2. Check the **Cron** section — you should see the `hello-from-python` job with exit code `0` and `100ms` duration
3. Your first data is on the dashboard!

<Aside>
If the cron section shows "no data yet", give it a few seconds and refresh. The API ingests data in near-real-time.
</Aside>

---

## Requirements

- Python 3.9+

## Install

```bash
pip install crontinel
# with httpx for async support:
pip install "crontinel[httpx]"
```

## Quick Start

```python
from crontinel import Crontinel
import os

client = Crontinel(
    api_key=os.environ["CRONTINEL_API_KEY"],
    app_name="my-worker",
)

# Report a cron job run
client.schedule_run(
    command="reports:generate",
    duration_ms=2340,
    exit_code=0,  # 0 = success, 1 = failure
)

# Report queue worker activity
client.queue_processed(
    queue="emails",
    processed=12,
    failed=0,
    duration_ms=8901,
)
```

## `monitor_schedule` helper

Wrap any function and automatically report its outcome:

```python
result, duration_ms, exit_code = client.monitor_schedule(
    "reports:generate",
    generate_daily_reports,
)
print(f"Completed in {duration_ms}ms, exit_code={exit_code}")
```

## Celery integration

```python
from celery import Celery
from crontinel import Crontinel
import time

app = Celery('tasks')
client = Crontinel(api_key=os.environ["CRONTINEL_API_KEY"])

@app.task
def send_emails(recipients):
    start = time.time()
    try:
        result = _send_emails(recipients)
        client.queue_processed(queue="emails", processed=len(recipients), failed=0,
                              duration_ms=int((time.time()-start)*1000))
        return result
    except Exception as e:
        client.queue_processed(queue="emails", processed=0, failed=len(recipients),
                              duration_ms=int((time.time()-start)*1000))
        raise
```

## APScheduler integration

```python
from apscheduler.schedulers.blocking import BlockingScheduler
from crontinel import Crontinel

client = Crontinel(api_key=os.environ["CRONTINEL_API_KEY"])
scheduler = BlockingScheduler()

@scheduler.scheduled_job("cron", hour=9, minute=0)
def daily_reports():
    duration_ms, exit_code = client.monitor_schedule("reports:generate", generate_reports)

scheduler.start()
```

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `CRONTINEL_API_KEY` | — | Your Crontinel API key (required) |
| `CRONTINEL_API_URL` | `https://app.crontinel.com` | SaaS or self-hosted endpoint |
