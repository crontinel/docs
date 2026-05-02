---
title: Self-Hosting
description: Run the Crontinel SaaS stack on your own server
---

:::note
Self-hosting requires you to manage upgrades, backups, and queue workers yourself. If that's not what you want, [app.crontinel.com](https://app.crontinel.com) handles all of this for you.
:::

Self-hosted Crontinel works fully standalone. You do not need a crontinel.com account or API key. The dashboard, alerts, and all monitoring features run entirely on your server.

:::caution[Repository access]
The `crontinel/app` repository requires an active **Pro or Team** plan subscription to clone. [See pricing](https://crontinel.com/pricing).

If you don't have subscription access yet, you can run the **Docker image** instead — it's publicly available with no repo access required. See [Docker setup](#docker-setup) below.
:::

## Docker setup

The fastest way to self-host without repository access. Pull and run the official image with Docker Compose:

See the included [`docker-compose.yml`](https://github.com/crontinel/docs/blob/main/docker-compose.yml) for a complete stack (app + PostgreSQL + Redis + Nginx):

```bash
# Download and start
curl -O https://raw.githubusercontent.com/crontinel/docs/main/docker-compose.yml
cp .env.example .env   # edit APP_KEY, DB_PASSWORD, etc.
docker compose up -d
docker compose exec app php artisan migrate --force
```

Then visit `http://localhost:8080` (or your configured port).

For full details on the Docker Compose file variables and customisation, see the [docker-compose.yml](https://github.com/crontinel/docs/blob/main/docker-compose.yml) in this repo.

---

## Manual install (requires repo access)

The steps below walk through a full manual install on a bare server.

## Requirements

| Component | Minimum version |
|---|---|
| PHP | 8.5 |
| PostgreSQL | 15 |
| Node.js | 20 |
| Redis | Optional — queue driver can be `database` or `sync` instead |

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

# Alert channels (email and webhook both work in self-hosted mode)
CRONTINEL_ALERT_CHANNEL=email
CRONTINEL_ALERT_EMAIL=alerts@your-domain.com
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
command=php /var/www/crontinel-app/artisan queue:work redis --queue=crontinel,default --sleep=3 --tries=3 --max-time=3600
directory=/var/www/crontinel-app
user=www-data
numprocs=2
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
stdout_logfile=/var/log/crontinel/worker.log
```

The `--queue=crontinel,default` flag is important. Without it, workers only process the `default` queue and won't pick up alert evaluation or ping processing jobs that Crontinel dispatches to the `crontinel` queue. The order matters: `crontinel` is listed first so those jobs get priority.

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

After install, visit `/crontinel` on your domain to open the monitoring dashboard. The dashboard shows Horizon status, queue throughput, and cron job data once the scheduler and queue workers are running.

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
