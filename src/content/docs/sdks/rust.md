---
title: Rust
description: Install and configure crontinel-rust for Rust applications
---

## Install

```toml
[dependencies]
crontinel = "0.1"
```

## Quick Start

```rust
use crontinel::Crontinel;

let client = Crontinel::new("your_api_key");

client.schedule_run("reports:generate", Some(1500), 0).unwrap();
client.queue_processed("emails", 50, 2, Some(3200)).unwrap();
client.event("deployment", "Application deployed", "info", None).unwrap();
```

## Builder

```rust
use std::time::Duration;

let client = Crontinel::builder("key")
    .api_url("https://custom.example.com")
    .app_name("my-worker")
    .timeout(Duration::from_secs(30))
    .build();
```

## `monitor_schedule`

```rust
let (ms, code) = client.monitor_schedule("reports:generate", || Ok(()));
assert_eq!(code, 0);
```

## Tokio cron-scheduler integration

```rust
use crontinel::Crontinel;
use tokio_cron_scheduler::{Job, JobScheduler};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Crontinel::new("your_api_key");
    let scheduler = JobScheduler::new().await?;

    let job = Job::new_async("0 9 * * *", move |_uuid, _l| {
        let client = client.clone();
        Box::pin(async move {
            let (ms, code) = client.monitor_schedule("daily-reports", || Ok(()));
            println!("Reports done in {ms}ms, code={code}");
        })
    })?;

    scheduler.add(job).await?;
    scheduler.start().await?;
    Ok(())
}
```
