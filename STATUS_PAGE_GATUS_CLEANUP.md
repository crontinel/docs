# Status Page: Gatus Cleanup — Migration Plan

**Owner:** ct (Crontinel agent)
**Date:** 2026-06-11
**Phase 6 deliverable** for the unified status page rollout (see `docs/merged-status-page-plan.md`).
**Task:** CT-SP-010 (kanban `t_4f92c819`).

## Decision

**The Laravel poller is the single source of truth for HTTP checks.** The Gatus
Dockerfile, config, and Railway service are deprecated. They remain in the
repo as local-dev scaffolding only, with explicit `DEPRECATED` banners, until
the Laravel-based status page is confirmed live in production and the
Cloudflare DNS cutover for `status.crontinel.com` is verified.

## Why

1. **Single system of record** — both Gatus and Laravel's `CheckStatusPages`
   were polling `app.crontinel.com/up` and `crontinel-production.up.railway.app/up`
   on overlapping intervals. Two pollers, two storage paths, two failure modes.
2. **Static config can't be dynamic** — Gatus config is YAML. Crontinel needs
   to add/remove customer endpoints at runtime, which Gatus cannot do without
   config regeneration and a process restart.
3. **Laravel is already doing the work** — `CheckStatusPages` is built,
   tested, and scheduled via `supervisord` + `schedule:work` on Railway
   (see `docs/ct-status-page-unified.md` Phases 0–3). The public
   `/status/{slug}` view is live in the Laravel app (Phase 4 + 5).
4. **Cost** — Gatus Railway service is ~$2-3/mo on top of the Laravel app
   and Railway Postgres. Trivial, but it is the principle: one less system
   to keep running.

## Current state (before this cleanup)

- Runtime poller: **Laravel `CheckStatusPages` + supervisord + Railway cron** ✅
- Public status page: **Laravel `GET /status/{slug}`** ✅
- Railway Gatus service: **expected to be already deleted** by Harun manually
  on the Railway dashboard (per Phase 2 of `docs/merged-status-page-plan.md`).
  This cleanup does not assume the deletion step is done; it makes the repo
  match the runtime state.

### Files that referenced Gatus as production-runner

| File | Path | Treatment in this cleanup |
| --- | --- | --- |
| `STATUS_SETUP.md` | repo root | Rewrite to point at the Laravel poller; mark Gatus as deprecated/historical. |
| `laravel/STATUS_SETUP.md` | `laravel/` submodule | Same rewrite as above. |
| `docs/ccbot-reference.md` | `docs/` | Remove "(to be deprecated)" from the `status/` entry; reclassify as archived. |
| `docs/INTEGRATION_PROOF_POINTS_PACK.md` | `docs/` | Drop the "BLOCKED on VPS + Gatus" framing for the status page proof point. The status page is shipping, not blocked. |
| `docs/ct-status-page-unified.md` | `docs/` | Add historical-context banner at the top. Content of the doc itself is still the architectural decision record. |
| `docs/status-pages-spec.md` | `docs/` | Add historical-context banner. The Gatus section is kept as the "why we did not pick Gatus" rationale. |
| `docs/ccbot-status-pages-prompt.md` | `docs/` | Add historical-context banner; soften the "Gatus running ... (to be deprecated)" line. |
| `docs/status-page-research.md` | `docs/` | Add historical-context banner; the Gatus options it evaluates are now research, not the implementation choice. |
| `docs/ccbot-status-page-unified.md` | `docs/` | Add historical-context banner. |
| `status/config.yaml` | `status/` submodule | Prepend a `DEPRECATED` header pointing readers to the Laravel poller. |
| `status/Dockerfile` | `status/` submodule | Leave intact (do not delete) so anyone running Gatus locally can still build the image. |
| `status-page-tmp/config.yaml` | `status-page-tmp/` submodule | Same `DEPRECATED` header. |
| `status-page-tmp/Dockerfile` | `status-page-tmp/` submodule | Leave intact. |

### Files intentionally not changed

- `DREAMS.md` (root + `laravel/`) — dream journal, not a status reference.
- `docs/DREAMS.md` — same.
- `archive/`, `overnight-reports/`, `memory/` — historical, not runtime docs.
- `worktrees/*` — worktrees will be re-derived from the main app repo and
  pick up the cleanup once main is re-merged.

## Migration order

1. **Landed first:** the `CheckStatusPages` command, the `StatusPage` /
   `StatusPageEndpoint` models, the `CrontinelStatusPageSeeder`, the
   `supervisord` config in `app/Dockerfile`, the `/status/{slug}` route and
   view, and incident tracking. See `app/` commit history (PRs #240–#246)
   and `docs/ct-status-page-unified.md` Phases 0–5. This cleanup **assumes
   that work is already merged and live**.
2. **This PR (Phase 6):** the documentation and config-file updates listed
   above. No runtime code changes. No Railway service mutation. No DNS
   changes.
3. **After this PR merges:** Harun manually deletes the Gatus service on
   the Railway dashboard (if not already done) and confirms
   `status.crontinel.com` Cloudflare CNAME points at `crontinel-production.up.railway.app`.
4. **Final follow-up card (future):** `git rm` the `status/` and
   `status-page-tmp/` submodule pointers from the root repo, and
   `git archive` both submodules for the historical record under
   `archive/`. The submodule dirs in `.git/modules` can be cleaned up
   with `git submodule deinit` once the dirs are removed.

   **Do not delete in this PR.** Deleting submodules rewrites git history
   (`.gitmodules` removal) and touches every clone. It also makes the
   "MARKED DEPRECATED" local-dev path stop working for any future
   archaeology. Defer to a separate task once runtime is verified.

## Verification

After the PR merges and the working tree is clean:

1. `rg -i "gatus" /Users/ray/Work/crontinel` should only match:
   - `DREAMS.md` (intentional — dream journal)
   - `archive/`, `overnight-reports/`, `memory/` (intentional — historical)
   - This file (`docs/STATUS_PAGE_GATUS_CLEANUP.md`) and the historical
     banners prepended to the docs above.
   - The `DEPRECATED` banners in `status/config.yaml` and
     `status-page-tmp/config.yaml`.
2. `rg "production.runner|production-runner" /Users/ray/Work/crontinel` should
   return zero matches.
3. `rg "~/Work/crontinel/status/" /Users/ray/Work/crontinel` should return
   only the `DEPRECATED` banner lines and this plan.
4. `rg "status/config.yaml" /Users/ray/Work/crontinel` should return only
   the same DEPRECATED lines and the historical `merged-status-page-plan.md`
   mention (Phase 6 step "Keep `status/config.yaml` as LOCAL DEVELOPMENT
   reference only") plus this plan.

## Rollback

- Doc changes are pure text. `git revert` is enough.
- Config.yaml banners are text-only. The Gatus Dockerfiles still build
  against `ghcr.io/twin/gatus:v5.10.0` if anyone needs to resurrect the
  service for local testing.
- No runtime code, no database, no Railway, no Cloudflare. Nothing in this
  cleanup mutates anything that would need a deploy to roll back.

## Acceptance criteria (from kanban `t_4f92c819`)

- [x] `status/config.yaml` removed from runtime docs or marked local-only.
      → Marked local-only via `DEPRECATED` banner; the file path is no
      longer presented in `STATUS_SETUP.md` as a runtime artifact.
- [x] No docs/instructions claim Gatus is production-runner.
      → All "production-runner" / "BLOCKED on Gatus" / "to be deprecated
      (active)" wording replaced with historical / "marked deprecated" /
      "no longer runtime" wording.
- [x] Migration plan exists before deleting stale files.
      → This file. The actual deletion is deferred to a follow-up card
      after runtime verification.
