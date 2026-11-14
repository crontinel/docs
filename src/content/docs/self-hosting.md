---
title: Self-Hosting
description: "Run the Crontinel hosted stack on a server you control when you don't want the dashboard to live only on app.crontinel.com."
---

:::note
Self-hosting requires you to manage upgrades, backups, and queue workers yourself. If that's not what you want, [app.crontinel.com](https://app.crontinel.com) handles all of this for you.
:::

Self-hosted Crontinel works fully standalone. You do not need a crontinel.com account or API key. The dashboard, alerts, and all monitoring features run entirely on your server.

> **Note:** The hosted product is [app.crontinel.com](https://app.crontinel.com). The app repo is private; self-hosting is an operator choice, not a Starter/Pro/Max entitlement claim. See [Billing & Plans](/billing/).

## Requirements

| Component | Minimum version |
|---|---|
| PHP | 8.4 |
| PostgreSQL | 15 |
| Node.js | 20 |
| Redis | Required. The app uses Laravel Horizon, and `.env.example` sets `QUEUE_CONNECTION=redis` and `CACHE_STORE=redis` |

## 1. Clone and install

```bash
git clone https://github.com/crontinel/app.git
cd app
composer install --no-dev --optimize-autoloader
npm ci && npm run build
```

## 2. Environment

```bash
cp .env.example .env
php artisan key:generate
```

Set these values in `.env`:

```ini
APP_URL=https://your-domain.com
APP_ENV=production
APP_DEBUG=false

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=crontinel
DB_USERNAME=postgres
DB_PASSWORD=
DB_SSLMODE=require

REDIS_HOST=127.0.0.1

MAIL_MAILER=resend
MAIL_FROM_ADDRESS=alerts@your-domain.com
```

## 3. Database

```bash
php artisan migrate --force
```

## 4. Permissions

```bash
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

## 5. Web server

Caddy is the simplest option here. It provisions TLS certificates automatically via Let's Encrypt with zero config. If you prefer Nginx, you'll need to manage certificates yourself (see below).

### Caddy

```
your-domain.com {
    root * /var/www/crontinel-app/public
    php_fastcgi unix//var/run/php/php8.5-fpm.sock
    file_server
}
```

### Nginx

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate     /etc/ssl/certs/your-domain.com.pem;
    ssl_certificate_key /etc/ssl/private/your-domain.com.key;

    root /var/www/crontinel-app/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.5-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

Replace the `ssl_certificate` and `ssl_certificate_key` paths with your actual cert and key. If you use Certbot, the paths are typically `/etc/letsencrypt/live/your-domain.com/fullchain.pem` and `privkey.pem`.

## 6. Queue workers

Crontinel needs a persistent queue worker to process ping events, alerts, and Horizon data.

Create a Supervisor config at `/etc/supervisor/conf.d/crontinel.conf`:

```ini
[program:crontinel-worker]
command=php /var/www/crontinel-app/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
directory=/var/www/crontinel-app
user=www-data
numprocs=2
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
stdout_logfile=/var/log/crontinel/worker.log

[program:crontinel-alerts]
command=php /var/www/crontinel-app/artisan queue:work cron-alerts --queue=cron-alerts --sleep=3 --max-time=3600
directory=/var/www/crontinel-app
user=www-data
numprocs=1
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
stdout_logfile=/var/log/crontinel/alerts.log
```

Cron run, missed-run and quality alerts are dispatched on the `cron-alerts` connection and queue, a database queue defined in `config/queue.php`. A worker on the default Redis connection does not process them, so run the second program. AI investigations and output grading use a separate `ai-investigations` database connection and queue; run a worker for it too if you use those features.

Then:

```bash
supervisorctl reread
supervisorctl update
supervisorctl start crontinel-worker:*
```

## 7. Scheduler

Add the Laravel scheduler to cron for `www-data`:

```bash
* * * * * cd /var/www/crontinel-app && php artisan schedule:run >> /dev/null 2>&1
```

## 8. Verify

```bash
php artisan queue:monitor redis:default
php artisan horizon:status
```

Check `/health` returns `200` -- that endpoint is always unauthenticated.

## Access the dashboard

After install, sign in and open `/dashboard` on your domain. Data appears once the scheduler and queue workers are running.

### Horizon access

Access to `/horizon` is limited by the `viewHorizon` gate in the app's `HorizonServiceProvider`. It allows signed-in users whose email is in `ADMIN_EMAILS`, a comma-separated list:

```env
ADMIN_EMAILS=admin@yourcompany.com,ops@yourcompany.com
```

If `ADMIN_EMAILS` is not set, nobody can open Horizon outside the local environment. This is separate from the Laravel package's dashboard, which uses the `crontinel.view` gate.

## Upgrades

```bash
git pull
composer install --no-dev --optimize-autoloader
npm ci && npm run build
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
supervisorctl restart crontinel-worker:*
```
