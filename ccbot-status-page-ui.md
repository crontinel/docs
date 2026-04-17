# CCBot Task: Status Pages — Phase 4 (Public View) + Phase 5 (Incidents)

## Context
Working in `~/Work/crontinel/app/` (Laravel app, git remote: `git@github.com:crontinel/app.git`).

**Current state:**
- `StatusPage` + `StatusPageEndpoint` models exist (with SoftDeletes, `consecutive_failures` column)
- `CheckStatusPages` command works (SQLite-compatible, verified ✅)
- `CrontinelStatusPageSeeder` seeded 3 endpoints for `status.crontinel` page
- `schedule:work` runs `status-pages:check` every minute via supervisord
- DB is **SQLite** on Railway (Supabase unreachable — fix pending)
- `DB_CONNECTION=sqlite` in Railway env vars

**Known issues already fixed:**
- SQLite-incompatible migrations wrapped in `if (driver === 'pgsql')`
- CheckStatusPages query uses SQLite `datetime()` workaround

---

## PHASE 4 — Public Status Page (`/status/{slug}`)

### 1. Route — `routes/web.php`
Add this route (no auth middleware — public):
```php
Route::get('/status/{slug}', [StatusPageController::class, 'show'])
    ->name('status-pages.public.show')
    ->middleware('etag');
```

### 2. Controller — `StatusPageController::show()`
```php
public function show(string $slug): View|Abort
{
    $page = StatusPage::where('slug', $slug)
        ->where('is_public', true)
        ->firstOrFail();

    $endpoints = $page->endpoints()
        ->orderBy('name')
        ->get()
        ->map(fn ($ep) => [
            'name' => $ep->name,
            'url' => $ep->url,
            'status' => $ep->last_status ?? 'unknown',
            'last_check_at' => $ep->last_check_at?->toIso8601String(),
            'response_time_ms' => $ep->last_response_time_ms,
            'consecutive_failures' => $ep->consecutive_failures,
        ]);

    $overallStatus = $endpoints->contains('status', 'down') ? 'degraded' : 'operational';

    return view('status-pages.show', [
        'page' => $page,
        'endpoints' => $endpoints,
        'overallStatus' => $overallStatus,
    ]);
}
```

### 3. View — `resources/views/status-pages/show.blade.php`
Clean public status page. Use:
- Dark theme (`bg-slate-950`, `text-white`)
- Header: page name, description, overall status badge (green=degraded/red=down)
- Endpoint list: name, URL, status badge (🟢 up / 🔴 down / ⚪ unknown), last checked time
- Incident banner: if ANY endpoint has `consecutive_failures >= 2`, show incident alert
- No auth, no dashboard controls — pure public read-only view

Example design:
```
┌─────────────────────────────────────────┐
│  Crontinel Status          [●] All Clear│
│  Live status of infrastructure          │
├─────────────────────────────────────────┤
│  App (app.crontinel.com)      🟢 UP     │
│  Railway Internal            🟢 UP       │
│  Landing Page               🔴 DOWN     │
│    Last checked: 2 min ago             │
└─────────────────────────────────────────┘
```

### 4. Etag Middleware
Laravel includes `ETERegenerate` middleware for etags, or use a simple cache header:
```php
Route::get('/status/{slug}', ...)->middleware('http.cache');
```

---

## PHASE 5 — Incident Tracking

### 1. Migration — `database/migrations/2026_04_16_create_status_page_incidents_table.php`
```php
public function up(): void
{
    Schema::create('status_page_incidents', function (Blueprint $table) {
        $table->id();
        $table->foreignId('status_page_id')->constrained()->cascadeOnDelete();
        $table->string('title');
        $table->text('description')->nullable();
        $table->string('status')->default('investigating'); // investigating|identified|monitoring|resolved
        $table->timestamp('started_at')->useCurrent();
        $table->timestamp('resolved_at')->nullable();
        $table->timestamps();
    });
}
```

### 2. Model — `app/Models/StatusPageIncident.php`
```php
class StatusPageIncident extends Model
{
    protected $fillable = ['status_page_id', 'title', 'description', 'status', 'started_at', 'resolved_at'];
    protected $casts = ['started_at' => 'datetime', 'resolved_at' => 'datetime'];
    
    public function statusPage(): BelongsTo { return $this->belongsTo(StatusPage::class); }
    public function isResolved(): bool { return $this->status === 'resolved'; }
}
```

### 3. Update `CheckStatusPages.php` — Wire incident logic
In `checkConcurrently()`, after checking each endpoint:

```php
// If status is 'down' and consecutive_failures just hit threshold → create incident
if ($result['status'] === 'down' && $endpoint->consecutive_failures === self::INCIDENT_THRESHOLD) {
    $endpoint->statusPage->incidents()->create([
        'title' => "{$endpoint->name} is down",
        'description' => $result['error'] ?? "No response from {$endpoint->url}",
        'status' => 'investigating',
        'started_at' => now(),
    ]);
}

// If status is 'up' and it was previously down → auto-resolve open incidents
if ($result['status'] === 'up' && $endpoint->getOriginal('last_status') === 'down') {
    $endpoint->statusPage->incidents()
        ->where('status', '!=', 'resolved')
        ->where('title', 'like', "%{$endpoint->name}%")
        ->update(['status' => 'resolved', 'resolved_at' => now()]);
}
```

Also add `StatusPage::incidents()` relationship:
```php
public function incidents(): HasMany
{
    return $this->hasMany(StatusPageIncident::class);
}
```

### 4. Update `StatusPageSeeder` (if exists) — seed sample incidents
Seed 1-2 resolved incidents for the Crontinel status page so the UI isn't empty.

---

## Important Notes

1. **SQLite compatibility** — all queries must be driver-agnostic. Use Eloquent instead of raw SQL where possible. Any raw SQL with `INTERVAL` or `NOW()` must use SQLite `datetime()` fallback.

2. **Fork-safe** — `CheckStatusPages` is run via `schedule:work` every minute. Multiple simultaneous runs are prevented by Laravel's schedule mutex.

3. **No Redis** — Railway env vars have `CACHE_DRIVER=array`, `QUEUE_CONNECTION=sync`. Don't configure Redis.

4. **Make sure** to add the `StatusPageIncident` relationship to `StatusPage` model and the `hasMany incidents` import.

5. **After committing**, let me know so I can push and redeploy Railway.

---

## Steps
1. Read `app/Models/StatusPage.php` and `app/Http/Controllers/StatusPageController.php` first
2. Read `resources/views/status-pages/` directory to see existing views
3. Implement Phase 4 first (route + controller + view)
4. Then Phase 5 (migration + model + wire into CheckStatusPages)
5. Commit each phase separately with clear messages
6. Tell me when done so I can push and redeploy
