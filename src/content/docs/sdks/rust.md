---
title: Rust
description: Install and configure crontinel-rust for Rust applications
---

import { Aside } from '@astrojs/starlight/components';

## Quickstart

Get from zero to your first data in under 3 minutes.

### 1. Prerequisites

- Rust 1.75+
- A Crontinel account ([sign up free](https://app.crontinel.com/register))
- An app created in the dashboard
- Your API key (`crn_live_...`) from app settings

### 2. Install

Add to your `Cargo.toml`:

```toml
[dependencies]
crontinel = "0.1"
```

### 3. Configure

Create a `src/bin/quickstart.rs` file:

```rust
use crontinel::Crontinel;
use std::env;

fn main() {
    let api_key = env::var("CRONTINEL_API_KEY")
        .expect("CRONTINEL_API_KEY must be set");
    let client = Crontinel::new(&api_key);

    client.schedule_run("hello-from-rust", Some(100), 0).unwrap();

    println!("Data sent to Crontinel!");
}
```

Set your API key and run it:

```bash
export CRONTINEL_API_KEY=crn_live_xxxxxxxxxxxx
cargo run --bin quickstart
```

### 4. Dashboard verification

1. Go to [app.crontinel.com](https://app.crontinel.com) → **Apps** → your app
2. Check the **Cron** section — you should see the `hello-from-rust` job with exit code `0` and `100ms` duration
3. Your first data is on the dashboard!

<Aside>
If the cron section shows "no data yet", give it a few seconds and refresh. The API ingests data in near-real-time.
</Aside>

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
