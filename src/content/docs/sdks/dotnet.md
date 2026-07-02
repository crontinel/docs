---
title: .NET
description: Install and configure the Crontinel .NET SDK for .NET applications
---

import { Aside } from '@astrojs/starlight/components';

## Quickstart

Get from zero to your first data in under 3 minutes.

### 1. Prerequisites

- .NET 8.0+ or .NET Standard 2.0
- A Crontinel account ([sign up free](https://app.crontinel.com/register))
- An app created in the dashboard
- Your API key (`crn_live_...`) from app settings

### 2. Install

```bash
dotnet new console -n Quickstart
cd Quickstart
dotnet add package Crontinel
```

### 3. Configure

Edit `Program.cs`:

```csharp
using Crontinel;
using Crontinel.Models;

var apiKey = Environment.GetEnvironmentVariable("CRONTINEL_API_KEY")
    ?? throw new InvalidOperationException("CRONTINEL_API_KEY not set");

var client = new CrontinelClient(apiKey);

await client.ScheduleRunAsync(new ScheduleRunOptions
{
    Command = "hello-from-dotnet",
    DurationMs = 100,
    ExitCode = 0
});

Console.WriteLine("Data sent to Crontinel!");
```

Set your API key and run it:

```bash
export CRONTINEL_API_KEY=crn_live_xxxxxxxxxxxx
dotnet run
```

### 4. Dashboard verification

1. Go to [app.crontinel.com](https://app.crontinel.com) → **Apps** → your app
2. Check the **Cron** section — you should see the `hello-from-dotnet` job with exit code `0` and `100ms` duration
3. Your first data is on the dashboard!

<Aside>
If the cron section shows "no data yet", give it a few seconds and refresh. The API ingests data in near-real-time.
</Aside>

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
