---
title: Go
description: Prefer the HTTP check-in recipes for Go. The Go package is not a supported outcome-receipt path until it has a maintenance owner.
---

import { Aside } from '@astrojs/starlight/components';

<Aside type="caution">
For outcome monitoring, use the [HTTP check-in recipes](/check-in/recipes/). This language package is **not** a supported path for the current offer until it sends the outcome receipt and has a maintenance owner. Prefer curl, Node `fetch`, `outcome_checkin.py`, Sidekiq/`Net::HTTP`, or GitHub Actions.
</Aside>

## Quickstart

Historical package install steps below. Prefer [check-in recipes](/check-in/recipes/) for new setups.

Get from zero to your first data in under 3 minutes.

### 1. Prerequisites

- Go 1.21+
- A Crontinel account ([sign up free](https://app.crontinel.com/login))
- An app created in the dashboard
- Your app's API key from app settings

### 2. Install

```bash
go get github.com/crontinel/go
```

### 3. Configure

Create a `quickstart.go` file:

```go
package main

import (
    "fmt"
    "os"
    "github.com/crontinel/go"
)

func main() {
    apiKey := os.Getenv("CRONTINEL_API_KEY")
    client := crontinel.NewClient(apiKey)

    client.ScheduleRun("hello-from-go", 100, 0)

    fmt.Println("Data sent to Crontinel!")
}
```

Set your API key and run it:

```bash
export CRONTINEL_API_KEY=your-app-key
go run quickstart.go
```

### 4. Dashboard verification

1. Go to [app.crontinel.com](https://app.crontinel.com) → **Apps** → your app
2. Check the **Cron** section — you should see the `hello-from-go` job with exit code `0` and `100ms` duration
3. Your first data is on the dashboard!

<Aside>
If the cron section shows "no data yet", give it a few seconds and refresh. The API ingests data in near-real-time.
</Aside>

---

## Install

```bash
go get github.com/crontinel/go
```

## Quick Start

```go
package main

import (
    "time"
    "github.com/crontinel/go"
)

func main() {
    client := crontinel.NewClient("your_api_key")

    client.ScheduleRun("reports:generate", 1500, 0)
    client.QueueProcessed("emails", 50, 2, 3200)
    client.Event("deployment", "Application deployed", "info", nil)
}
```

## `MonitorSchedule`

Run a function and auto-report its outcome:

```go
durationMs, exitCode := client.MonitorSchedule("reports:generate", func() error {
    return generateReports()
})
fmt.Printf("Completed in %dms, exit_code=%d\n", durationMs, exitCode)
```

## Asynq integration

```go
import "github.com/hibiken/asynq"
import "github.com/crontinel/go"

func HandleTask(ctx context.Context, t *asynq.Task) error {
    start := time.Now()
    err := processTask(t.Payload())
    durationMs := int(time.Since(start).Milliseconds())
    if err != nil {
        client.QueueProcessed("default", 0, 1, durationMs)
        return err
    }
    client.QueueProcessed("default", 1, 0, durationMs)
    return nil
}
```

## Options

```go
client := crontinel.NewClient("key",
    crontinel.WithAPIURL("https://custom.example.com"),
    crontinel.WithAppName("my-worker"),
    crontinel.WithHTTPClient(&http.Client{Timeout: 30 * time.Second}),
)
```

## Environment variables

The client reads none. Pass the key to `NewClient` and set a self-hosted URL with `WithAPIURL`, as the examples do.

## What it sends

Each call is a JSON-RPC request to `/api/mcp` (for example `notify/schedule_run`), not the run receipt at `POST /api/v1/ingest/cron`, so it carries no outcome metrics. Every method returns an `error`; check it, because a rejected call does not panic.
