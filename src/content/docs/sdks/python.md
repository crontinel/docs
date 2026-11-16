---
title: Python
description: Send the outcome receipt from Python with the check-in script or a few lines of urllib. The crontinel package is not on PyPI.
---

Use the [HTTP check-in recipe](/check-in/recipes/) for Python. It shows `outcome_checkin.py` and a plain `urllib` version; both send the run receipt with the app ingest key and need no package.

## Why not `pip install crontinel`

The package is not a supported path:

- `crontinel` is not published on PyPI, so `pip install crontinel` fails.
- The code in [crontinel/python](https://github.com/crontinel/python) talks to the MCP endpoint rather than the run receipt (`POST /api/v1/ingest/cron`). Its default client also needs `requests`, which it does not declare as a dependency.
- It has no agent you can install. The remote command agent is in the [Laravel package](/agent/guide/).

This page will cover the package again once it is published, sends the run receipt and has a maintainer.
