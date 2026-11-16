---
title: Rust
description: Send the outcome receipt from Rust with an HTTP client. The crontinel crate on crates.io does not record runs.
---

Use the [HTTP check-in recipe](/check-in/recipes/) from Rust: one `POST /api/v1/ingest/cron` with the app ingest key, sent with any HTTP client such as `reqwest`.

## Why not the `crontinel` crate

The crate is not a working path:

- crates.io has only version 0.1.0. Its calls send `ran_at` as a Unix number, and Crontinel rejects every one with `ran_at must be a valid date`, so `schedule_run(...).unwrap()` panics and nothing is recorded.
- It talks to the MCP endpoint (`/api/mcp`), not the run receipt, so it cannot send outcome metrics.

This page will cover the crate again once a release records runs, sends the run receipt and has a maintainer.
