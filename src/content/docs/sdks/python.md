---
title: Python
description: Send the outcome receipt from Python with the standard-library check-in script. The crontinel package is not on PyPI.
---

Use the [HTTP check-in recipe](/check-in/recipes/) for Python. It uses `outcome_checkin.py`, which needs only the standard library, and shows wrappers for APScheduler and Celery. All of them send the run receipt with the app ingest key, with no package to install.

## Why not `pip install crontinel`

The package is not a supported path:

- `crontinel` is not published on PyPI, so `pip install crontinel` fails.
- The code in [crontinel/python](https://github.com/crontinel/python) talks to the MCP endpoint rather than the run receipt (`POST /api/v1/ingest/cron`). Its default client also needs `requests`, which it does not declare as a dependency.
- It has no agent you can install. The remote command agent is in the [Laravel package](/agent/guide/).

This page will cover the package again once it is published, sends the run receipt and has a maintainer.
