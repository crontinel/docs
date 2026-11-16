---
title: PHP
description: Send the outcome receipt from PHP with an HTTP request. The crontinel/php library has no client that talks to Crontinel.
---

For Laravel, use the [Laravel package](/sdks/laravel/). For any other PHP job, use the [HTTP check-in recipe](/check-in/recipes/): one `POST /api/v1/ingest/cron` with the app ingest key, sent with curl or Guzzle.

## Why not `crontinel/php`

`composer require crontinel/php` installs version 0.1.1, which holds data objects, monitor contracts and an alert manager used inside the Laravel package. It has no `Crontinel\Client` class and makes no HTTP calls, so it cannot send anything to Crontinel on its own.
