---
title: .NET
description: Install and configure the Crontinel .NET SDK for .NET applications
---

## Requirements

- .NET 8.0+ or .NET Standard 2.0

## Install

```bash
dotnet add package Crontinel
```

## Quick Start

```csharp
using Crontinel;
using Crontinel.Models;

var client = new CrontinelClient(
    Environment.GetEnvironmentVariable("CRONTINEL_API_KEY")!
);

// Report a cron job run
await client.ScheduleRunAsync(new ScheduleRunOptions
{
    Command = "reports:generate",
    DurationMs = 2340,
    ExitCode = 0  // 0 = success, non-zero = failure
});

// Report queue worker activity
await client.QueueProcessedAsync(new QueueProcessedOptions
{
    Queue = "emails",
    Processed = 12,
    Failed = 0,
    DurationMs = 8901
});
```

## `MonitorScheduleAsync` helper

Wrap any async function and automatically report its outcome:

```csharp
var result = await client.MonitorScheduleAsync("reports:generate", async () =>
{
    await SendDailyReports();
    return true;
});

Console.WriteLine($"Duration: {result.DurationMs}ms, ExitCode: {result.ExitCode}");
```

If the inner function throws, the exception propagates and `ExitCode` is set to `1`.

## ASP.NET Core / Worker Service

Register as a singleton in `Program.cs`:

```csharp
builder.Services.AddSingleton<CrontinelClient>(_ =>
    new CrontinelClient(
        Environment.GetEnvironmentVariable("CRONTINEL_API_KEY")!
    ));
```

Use in a hosted service:

```csharp
public class MyWorker : BackgroundService
{
    private readonly CrontinelClient _crontinel;

    public MyWorker(CrontinelClient crontinel) => _crontinel = crontinel;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await _crontinel.MonitorScheduleAsync("my-worker-tick", async () =>
            {
                await DoWorkAsync();
            }, stoppingToken);

            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}
```

## Hangfire integration

```csharp
using Crontinel;
using Crontinel.Models;

var client = new CrontinelClient(apiKey);

RecurringJob.AddOrUpdate("sync-data", async () =>
{
    await client.MonitorScheduleAsync("sync-data", async () =>
    {
        await DataSyncAsync();
    });
}, Cron.Hourly);
```

## Configuration

```csharp
var client = new CrontinelClient(new CrontinelOptions
{
    ApiKey = "your-api-key",
    ApiUrl = "https://app.crontinel.com",  // optional, defaults to SaaS
    AppName = "my-service",                // optional, default: "dotnet"
    UserAgent = "my-app/1.0"              // optional
});
```

## Environment variables

The .NET SDK does not read environment variables automatically. Pass values explicitly via `CrontinelOptions` or set them in your app's configuration and inject them at construction time.
