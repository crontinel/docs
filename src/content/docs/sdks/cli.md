---
title: CLI / Docker
description: Monitor any cron job, Docker container, or Kubernetes CronJob with the Crontinel CLI
---

import { Aside } from '@astrojs/starlight/components';

## Quickstart

Get from zero to your first ping in under 2 minutes.

### 1. Prerequisites

- A Crontinel account ([sign up free](https://app.crontinel.com/register))
- An app created in the dashboard
- Your API key (`crn_live_...`) from app settings

### 2. Install

**macOS (Homebrew):**

```bash
brew tap crontinel/cli
brew install crontinel
```

**Linux / macOS (curl):**

```bash
curl -sSL https://raw.githubusercontent.com/crontinel/cli/main/install.sh | sh
```

**Or download the binary directly:**

```bash
curl -L https://github.com/crontinel/cli/releases/latest/download/crontinel -o crontinel
chmod +x crontinel
mv crontinel /usr/local/bin/
```

**Docker:**

```bash
docker pull ghcr.io/crontinel/cli:latest
```

### 3. Configure

Set your API key:

```bash
export CRONTINEL_API_KEY=crn_live_xxxxxxxxxxxx
```

Add it to `~/.bashrc` or `~/.zshrc` to persist across sessions.

### 4. First ping

```bash
crontinel ping
```

Expected output:

```
OK — connected to app.crontinel.com
```

### 5. Wrap a command

Run any command and report its outcome automatically:

```bash
crontinel run -- echo "hello world"
```

You'll see output with the exit code and duration.

### 6. Dashboard verification

1. Go to [app.crontinel.com](https://app.crontinel.com) → **Apps** → your app
2. Check the **Events** section — you should see the `crontinel run` command with its exit code and duration
3. Your first data is now on the dashboard!

<Aside>
The CLI reports each wrapped command as a cron job run. You'll see every command you run with `crontinel run -- <cmd>` in the dashboard's cron section.
</Aside>

---

## Install

### macOS / Linux

```bash
curl -sSL https://raw.githubusercontent.com/crontinel/cli/main/install.sh | sh
```

### Download binary

```bash
curl -L https://github.com/crontinel/cli/releases/latest/download/crontinel -o crontinel
chmod +x crontinel
mv crontinel /usr/local/bin/
```

### Docker

```bash
docker pull ghcr.io/crontinel/cli:latest
```

## Setup

```bash
export CRONTINEL_API_KEY=your_key_here
crontinel ping
# OK — connected to app.crontinel.com
```

## Usage

### Wrap a command

Reports the exit code and duration automatically:

```bash
crontinel run -- my-cron-job --option
```

### Send a custom event

```bash
crontinel event \
  --key deploy-success \
  --message "Deployed OK" \
  --state resolved
```

## Docker examples

### Wrap any Docker command

```bash
docker run --rm \
  -e CRONTINEL_API_KEY=$CRONTINEL_API_KEY \
  ghcr.io/crontinel/cli:latest \
  run -- docker-health-check
```

### Kubernetes CronJob

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: my-cron
spec:
  schedule: "0 9 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: crontinel
            image: ghcr.io/crontinel/cli:latest
            command: ["crontinel", "run", "--", "./run.sh"]
            env:
            - name: CRONTINEL_API_KEY
              valueFrom:
                secretKeyRef:
                  name: crontinel
                  key: api-key
```

## Commands

| Command | Description |
|---|---|
| `crontinel run -- <cmd>` | Run a command and report outcome |
| `crontinel event --key <key> --message <msg> --state <state>` | Send a custom event |
| `crontinel ping` | Test connectivity |
| `crontinel monitors` | List all monitors |
| `crontinel events` | View recent firing/resolved events |

## Options

| Flag | Default | Description |
|---|---|---|
| `--key <key>` | env `CRONTINEL_API_KEY` | API key |
| `--url <url>` | `https://app.crontinel.com` | API endpoint |
| `--app <name>` | hostname | App/service name |
| `--json` | — | Raw JSON output |
