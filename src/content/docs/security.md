---
title: Security
description: Lock down the Crontinel dashboard, verify webhook signatures, and protect sensitive operational data in your Laravel application.
---

## Dashboard access control

The Crontinel dashboard at `/crontinel` shows your cron schedules, queue depths, job names, and error counts. That's internal operational data you don't want exposed to every authenticated user.

By default, the package applies `['web', 'auth']` middleware. That checks whether someone is logged in, but it doesn't check _who_ they are. Any authenticated user in your app can see the dashboard. In most production apps, that's not what you want.

### Gate-based authorization

The simplest fix is a Laravel Gate. Register it in your `AppServiceProvider`:

```php
use Illuminate\Support\Facades\Gate;

public function boot(): void
{
    Gate::define('viewCrontinel', function ($user) {
        return in_array($user->email, [
            'you@yourcompany.com',
            'ops-lead@yourcompany.com',
        ]);
    });
}
```

Then add the gate check as middleware in `config/crontinel.php`:

```php
'middleware' => ['web', 'auth', 'can:viewCrontinel'],
```

Now only the users you've listed can access the dashboard. Everyone else gets a 403.

### Custom middleware for roles

If you're using Spatie Permission or a similar package, swap in a role check instead:

```php
'middleware' => ['web', 'auth', 'role:admin'],
```

Or write your own middleware if you need something more specific. The `middleware` array in the config accepts anything you'd pass to a Laravel route group.

### IP restriction

For internal tools behind a VPN, you can restrict by IP:

```php
'middleware' => ['web', 'auth', \App\Http\Middleware\RestrictToVpn::class],
```

A quick middleware that checks `$request->ip()` against an allowlist does the job. In practice, combining IP restriction with role-based auth gives you two layers of protection.

## Sensitive data in cron output

Here's the thing: the dashboard displays your scheduled command names exactly as they appear in your `Kernel` or `routes/console.php`. If you're passing sensitive data as arguments, it shows up in the UI.

For example, a command like this:

```php
$schedule->command('user:export --email=john@example.com')->daily();
```

That email address is now visible to anyone with dashboard access. Same goes for API keys, tokens, or internal IDs passed as command arguments.

The fix is simple. Pass sensitive values through config or environment variables instead of command arguments:

```php
// Bad: sensitive data in the command string
$schedule->command('report:send --api-key=sk_live_abc123')->hourly();

// Good: read from env inside the command
$schedule->command('report:send')->hourly();
```

Review what your dashboard actually shows. Run `php artisan crontinel:status` to see the same data the dashboard renders. If anything there makes you uncomfortable, refactor those commands before going live.

## Webhook HMAC verification

When Crontinel sends alert payloads to your webhook URL, each request includes an `X-Crontinel-Signature` header. This is an HMAC-SHA256 hash of the request body, signed with your webhook secret.

You should verify this signature on the receiving end. Otherwise anyone who discovers your webhook URL can send fake alerts.

```php
use Illuminate\Http\Request;

public function handleCrontinelWebhook(Request $request): Response
{
    $secret = config('crontinel.webhook_secret');
    $payload = $request->getContent();
    $signature = $request->header('X-Crontinel-Signature');

    $expected = hash_hmac('sha256', $payload, $secret);

    if (! hash_equals($expected, $signature)) {
        abort(403, 'Invalid signature');
    }

    // Process the alert payload
    $data = json_decode($payload, true);

    return response('OK', 200);
}
```

Two things to note. Use `hash_equals()` instead of `===` to prevent timing attacks. And store your webhook secret in your `.env` file, not in version control:

```env
CRONTINEL_WEBHOOK_SECRET=your-random-secret-here
```

Generate a strong secret with `php artisan tinker --execute="echo bin2hex(random_bytes(32));"` and set the same value both in your Crontinel config and on the receiving server.

## SaaS data minimization

If you connect Crontinel to the hosted dashboard at app.crontinel.com, you might wonder what data leaves your server. The answer: very little.

Crontinel sends exactly four fields per cron run:

- Command name (e.g., `schedule:run`, `horizon:snapshot`)
- Exit code (0 for success, non-zero for failure)
- Run duration in milliseconds
- Timestamp of execution

It doesn't read or transmit `.env` values, log files, command output, or database contents. Just those four fields.

If you want to verify this yourself, check the `SaasReporter` class in the package source. The payload is a plain JSON object with those four keys. You can also inspect outgoing requests by pointing `CRONTINEL_SAAS_URL` to a local endpoint or a request inspection tool like Requestbin during development.

## Production checklist

Before deploying Crontinel to production, run through these steps:

- Replace the default `['web', 'auth']` middleware with a Gate or role check that limits dashboard access to ops/admin users
- Audit your scheduled commands for sensitive data in arguments or names
- Set `CRONTINEL_WEBHOOK_SECRET` in your `.env` and verify signatures on the receiving end
- Change the default dashboard path from `/crontinel` to something less guessable if you're not behind a VPN: set `CRONTINEL_PATH` in your `.env`
- Review `php artisan crontinel:status` output to confirm nothing unexpected is exposed
- If you don't need the SaaS reporter, disable it in `config/crontinel.php` to keep all data on your server
- Test your Gate/middleware by logging in as a non-admin user and confirming the dashboard returns a 403
- Set your webhook endpoints to HTTPS only, never plain HTTP

Get these right before your first deploy. Fixing auth gaps after something leaks is a lot less fun.
