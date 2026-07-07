---
title: Laravel
description: Install and configure crontinel/laravel for Laravel applications
---

## Requirements

- PHP 8.2+
- Laravel 11+
- Composer 2+

## Install

```bash
composer require crontinel/laravel
```

Publish the config and migration:

```bash
php artisan vendor:publish --provider="Crontinel\CrontinelServiceProvider"
php artisan migrate
```

## Quick Start

Set your API credentials in `.env`:

```env
CRONTINEL_API_KEY=your-api-key
CRONTINEL_APP_ID=your-app-slug
```

The package automatically reports cron runs, queue depth, and Horizon metrics to your Crontinel dashboard. No additional setup is needed for basic monitoring.

## Running the Agent

The Laravel package includes a built-in agent daemon that polls `app.crontinel.com` for remote commands:

```bash
php artisan crontinel:agent
```

For production, generate a systemd unit or supervisor config:

```bash
# Generate systemd unit
php artisan crontinel:agent --systemd

# Generate supervisor config
php artisan crontinel:agent --supervisor
```

See the [Agent Guide](/agent/guide/) for full details.

## Configuration

Publish and review `config/crontinel.php` for all available options including alert channels, polling intervals, and output capture settings.
