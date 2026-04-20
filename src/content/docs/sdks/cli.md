---
title: CLI / Docker
description: Monitor any cron job, Docker container, or Kubernetes CronJob with the Crontinel CLI
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
