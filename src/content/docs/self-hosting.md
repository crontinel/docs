---
title: Self-Hosting
description: Run the Crontinel SaaS stack on your own server
---

:::note
Self-hosting requires you to manage upgrades, backups, and queue workers yourself. If that's not what you want, [app.crontinel.com](https://app.crontinel.com) handles all of this for you.
:::

## Requirements

| Component | Minimum version |
|---|---|
| PHP | 8.2 |
| MySQL / MariaDB | 8.0 / 10.6 |
| Redis | 6.0 |
| Node.js | 18 |

## 1. Clone and install

```bash
git clone https://github.com/crontinel/app.git
cd crontinel-app
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

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=crontinel
DB_USERNAME=crontinel
DB_PASSWORD=

REDIS_HOST=127.0.0.1

MAIL_MAILER=smtp          # or resend — set RESEND_API_KEY instead
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

### Nginx

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    root /var/www/crontinel/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### Caddy

```
your-domain.com {
    root * /var/www/crontinel/public
    php_fastcgi unix//var/run/php/php8.2-fpm.sock
    file_server
}
```

## 6. Queue workers

Crontinel needs two persistent workers: one for alert evaluation, one for Horizon ingest.

Create a Supervisor config at `/etc/supervisor/conf.d/crontinel.conf`:

```ini
[program:crontinel-worker]
command=php /var/www/crontinel/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
directory=/var/www/crontinel
user=www-data
numprocs=2
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
stdout_logfile=/var/log/crontinel/worker.log
```

Then:

```bash
supervisorctl reread
supervisorctl update
supervisorctl start crontinel-worker:*
```

## 7. Scheduler

Add the Laravel scheduler to cron for `www-data`:

```bash
* * * * * cd /var/www/crontinel && php artisan schedule:run >> /dev/null 2>&1
```

## 8. Verify

```bash
php artisan queue:monitor redis:default
php artisan horizon:status
```

Check `/health` returns `200` — that endpoint is always unauthenticated.

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
