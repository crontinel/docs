# Feature 9: Package family guidance

**Stage:** 4 — Package rollout and release

**Goal:** Make package onboarding work across the major families without forcing one universal path.

## Task group A: Family-specific guidance
- Define the Laravel, Node, Python, PHP, and other-repo tabs.
- Keep the general tab first, then family-specific guidance.
- Capture the copy-paste snippets and short explanations required for each path.

**Acceptance criteria**
- The package guidance works for multiple families.
- The general tab remains the first orientation point.

## Task group B: Package rollout order
- Define the order for package support rollout.
- Keep Laravel, Node, and Python as the highest-priority families.
- Leave room for the rest of the package ecosystem.

**Acceptance criteria**
- The rollout order is explicit.
- The plan honors the package priority decisions already collected.

## Implementation definition

### Current baseline to reuse
- Onboarding install already includes multi-family tabs, but the default is `Custom` and app detail currently shows Laravel-only copy.
- Local package surfaces exist for PHP/root Composer, Laravel, Node, and Python:
  - `/Users/ray/Work/crontinel/composer.json`
  - `/Users/ray/Work/crontinel/laravel/composer.json`
  - `/Users/ray/Work/crontinel/node/package.json`
  - `/Users/ray/Work/crontinel/python/pyproject.toml`
- Master plan priority: Laravel, Node, and Python are most important, while all package surfaces should fit the pattern.

### Tab order
1. General.
2. Laravel.
3. PHP.
4. Node.
5. Python.
6. Other.

### General tab
- Purpose: orient every user before family-specific setup.
- Show API key, API URL, app name/slug, and test connection.
- Copy: `Use these values with any Crontinel package or direct API integration.`
- Do not assume a language in the General tab.

### Family guidance minimums
- Laravel:
  - Install snippet: `composer require crontinel/laravel`.
  - Setup snippet: `php artisan crontinel:install`.
  - Explain scheduler/queue reporting in 2-4 short steps.
- PHP:
  - Install snippet should align with the PHP package name from the package repo during implementation.
  - Include API key/API URL environment variables and a direct client example only after confirming package API.
- Node:
  - Install snippet should align with `/node/package.json` package name during implementation.
  - Include environment variables and a minimal cron/job wrapper example.
- Python:
  - Install snippet should align with `/python/pyproject.toml` package name during implementation.
  - Include environment variables and a minimal function/job example.
- Other:
  - Link to package ecosystem docs/repos.
  - Say `More package guides are coming` rather than inventing unsupported commands.

### Rollout order
1. Laravel.
2. Node.
3. Python.
4. PHP/root package.
5. Other existing package surfaces.
6. Additional languages only after the first four are verified.

### Consistency rules
- App page and onboarding install should use the same tab names, same order, same API URL, and same copy patterns.
- Snippets must be copy-pasteable but short.
- Explanations should stay below the snippet and answer what the command does.
- Avoid claiming a package command exists until verified against that package repo.

### Implementation handoff
- Code targets: `/Users/ray/Work/crontinel/app` for dashboard/onboarding UI; package repos under `/Users/ray/Work/crontinel/laravel`, `/node`, `/python`, and root PHP package for package-specific verification.
- Use separate feature branches/worktrees per repo if package code changes are needed.
- First app files likely to change: `resources/views/onboarding/install.blade.php` and `resources/views/apps/show.blade.php`.
- Package command verification should happen before final release handoff.