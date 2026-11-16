---
title: Rust
description: The crontinel crate (0.1.1+) records runs from Rust. For outcome metrics, send the HTTP check-in receipt.
---

The `crontinel` crate records that a job ran, how long it took and its exit code. It does not send outcome metrics, so it cannot catch a job that finished but did nothing. For that, send the [HTTP check-in receipt](/check-in/recipes/) with a count from inside the job.

Use 0.1.1 or later. Crontinel rejects every call from 0.1.0 (`ran_at must be a valid date`).

## Install

```toml
[dependencies]
crontinel = "0.1"
```

## Quickstart

```rust
use crontinel::Crontinel;
use std::env;

fn main() {
    let api_key = env::var("CRONTINEL_API_KEY")
        .expect("CRONTINEL_API_KEY must be set");
    let client = Crontinel::new(&api_key);

    client.schedule_run("hello-from-rust", Some(100), 0).unwrap();
    client.event("deployment", "Application deployed", "info", None).unwrap();
    client.queue_processed("emails", 50, 2, Some(3200)).unwrap();

    println!("Data sent to Crontinel!");
}
```

Use your app's ingest key. `hello-from-rust` then shows on the dashboard as a completed run.

## Options

```rust
use std::time::Duration;

let client = Crontinel::builder("key")
    .api_url("https://custom.example.com")
    .app_name("my-worker")
    .timeout(Duration::from_secs(30))
    .build();
```

The client reads no environment variables; pass the key and URL as above.

## What it sends

Each call is a JSON-RPC request to `/api/mcp` (for example `notify/schedule_run`), not the run receipt at `POST /api/v1/ingest/cron`. Every method returns a `Result`; a rejected call is an `Err`, not a panic, unless you `unwrap` it.
