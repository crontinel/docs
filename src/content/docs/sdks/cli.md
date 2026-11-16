---
title: CLI
description: The crontinel CLI reads your app's jobs and alerts from the terminal with the app key. To report runs, use the HTTP check-in.
---

import { Aside } from '@astrojs/starlight/components';

<Aside>
The CLI only reads. To report a job's runs and outcomes, use the [HTTP check-in recipes](/check-in/recipes/) (curl in a cron wrapper, a Kubernetes CronJob, or a CI step).
</Aside>

## Install

With Homebrew (macOS or Linux):

```bash
brew install crontinel/tap/crontinel
```

Or download the archive for your platform from the [v0.1.1 release](https://github.com/crontinel/cli/releases/tag/v0.1.1) (`darwin` or `linux`, `amd64` or `arm64`), unpack it and put `crontinel` on your `PATH`:

```bash
curl -fsSL https://github.com/crontinel/cli/releases/download/v0.1.1/crontinel_0.1.1_linux_amd64.tar.gz | tar xz
sudo mv crontinel_0.1.1_linux_amd64/crontinel /usr/local/bin/
```

## Authenticate

The CLI uses your app's key, the same one the check-in uses. Pass it as `--key` or set it in the environment:

```bash
export CRONTINEL_API_KEY=your-app-key
```

## Commands

```bash
crontinel ping       # check the key and connection
crontinel monitors   # jobs that reported to this app, with their last status
crontinel alerts     # recent alerts for this app
crontinel events     # alerts from the last 72 hours
```

`ping` prints:

```text
✓ Connected to Crontinel
  Available tools: 7
```

`monitors` prints one line per job:

```text
Scheduled jobs (2):
  ✗ nightly-import (last: failed)
  ● orders-sync (last: completed)
```

`health` is an alias for `ping`, and `list` for `monitors`.

## Options

| Option | Meaning |
|---|---|
| `--key <key>` | App key. Defaults to `CRONTINEL_API_KEY`. |
| `--url <url>` | API URL. Defaults to `https://app.crontinel.com`. |
| `--json` | Print the raw JSON response. |
