---
title: Ruby on Rails
description: Send the outcome receipt from Rails jobs with Net::HTTP. The crontinel-rails gem does not reach Crontinel with its defaults.
---

Use the [HTTP check-in recipes](/check-in/recipes/) from Rails: the Sidekiq and `Net::HTTP` recipe works the same way in an Active Job.

## Why not `crontinel-rails`

The gem is not a working path:

- Its default endpoint is `https://app.crontinel.com/api/v1`, and the client appends `/api/mcp` to it, so every call goes to `/api/v1/api/mcp` and fails with `404 Not Found`.
- Its Active Job hook names each run `JobClass-<job_id>`, so every run would appear as a new job instead of runs of one job.
- It talks to the MCP endpoint, not the run receipt (`POST /api/v1/ingest/cron`), so it cannot send outcome metrics.

For plain Ruby, the [`crontinel` gem](/sdks/ruby/) does record runs. This page will cover the Rails gem again once it records runs with its defaults and has a maintainer.
