---
title: Go
description: Install and configure crontinel/go for Go applications
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
    durationMs := time.Since(start).Milliseconds()
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
    crontinel.WithTimeout(30*time.Second),
)
```

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `CRONTINEL_API_KEY` | — | Your Crontinel API key |
| `CRONTINEL_API_URL` | `https://app.crontinel.com` | SaaS or self-hosted endpoint |
