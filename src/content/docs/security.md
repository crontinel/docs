---
title: Security
description: Lock down the Crontinel dashboard, verify webhook signatures, and protect sensitive operational data in your Laravel application.
---

## Dashboard hardening

### Restrict access with middleware

By default, the dashboard uses `['web', 'auth']` middleware — any authenticated user can view it. For production, restrict access further:

```php
// config/crontinel.php
'middleware' => ['web', 'auth', 'can:viewCrontinel'],
```

Define the `viewCrontinel` gate in a service provider:

```php
Gate::define('viewCrontinel', function ($user) {
    return in_array($user->email, explode(',', env('CRONTINEL_ADMIN_EMAILS', '')));
});
```

Or use a role check if you have a role system:

```php
Gate::define('viewCrontinel', fn ($user) => $user->hasRole('admin'));
```

### Move the dashboard path

Change the default `/crontinel` path to something less predictable:

```env
CRONTINEL_PATH=internal/ops/monitor
```

The dashboard is then at `/internal/ops/monitor`. Security through obscurity alone isn't sufficient — always require authentication — but an unusual path reduces automated scanning.

### HTTPS only

The dashboard exposes operational data (job names, queue depths, failure rates). Always serve it over HTTPS in production. In Laravel, force HTTPS by setting `APP_URL` to an `https://` URL and using `URL::forceScheme('https')` in a service provider if your server terminates TLS upstream.

---

## What data the package captures

Crontinel records the following from your Laravel application:

| Data type | What's captured | What's NOT captured |
|---|---|---|
| Cron runs | Command name, status, duration, exit code | Command arguments, output content |
| Queue | Queue name, depth count, failed count | Job payloads, job class arguments |
| Horizon | Status, supervisor count, failed/min rate | Job data, worker logs |

**No user data, no request data, no environment variables, and no application secrets are captured.**

Job output can optionally be captured if `'capture_output' => true` is set in `config/crontinel.php`, but this is disabled by default and should only be enabled if your job output contains no sensitive data.

---

## What data is sent to the SaaS

**Nothing is sent unless `CRONTINEL_API_KEY` is set in your environment.**

When the key is present, the package sends the data types listed above (cron summaries, queue snapshots, Horizon status) to `app.crontinel.com` over HTTPS. Data is transmitted as JSON in the request body.

If you operate in an air-gapped or restricted environment, omit `CRONTINEL_API_KEY` entirely. The local dashboard works without it.

---

## Webhook HMAC signing

When Crontinel fires an outbound webhook alert, it signs the request body with HMAC-SHA256 using a secret you define. This lets your endpoint verify the request came from Crontinel and wasn't tampered with.

### Configuring the secret

```env
CRONTINEL_WEBHOOK_SECRET=your-signing-secret
```

```php
// config/crontinel.php
'webhook' => [
    'url'    => env('CRONTINEL_WEBHOOK_URL'),
    'secret' => env('CRONTINEL_WEBHOOK_SECRET'),
],
```

### Verifying the signature

Crontinel adds an `X-Crontinel-Signature` header to every webhook request:

```
X-Crontinel-Signature: sha256=<hex_digest>
```

Verify it in your endpoint:

```php
$payload   = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_CRONTINEL_SIGNATURE'] ?? '';
$expected  = 'sha256=' . hash_hmac('sha256', $payload, env('CRONTINEL_WEBHOOK_SECRET'));

if (! hash_equals($expected, $signature)) {
    http_response_code(401);
    exit('Invalid signature');
}
```

Use `hash_equals()` to prevent timing attacks.

---

## Additional recommendations

- **Rotate `CRONTINEL_API_KEY` regularly** if you use the SaaS. Revoke and reissue from the app dashboard under Settings → API Keys.
- **Use a dedicated alert email address** (`alerts@your-company.com`) rather than a personal inbox — this makes it easier to audit who receives operational alerts.
- **Audit team members** on your Crontinel account periodically. Access is managed per-team; remove former employees from the dashboard team as part of your offboarding checklist.
