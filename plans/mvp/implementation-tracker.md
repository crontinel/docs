# Crontinel MVP Implementation Tracker

**Status:** All MVP planning features (3-10) are merged into `main`; PR 246 merged with local Feature suite (298 tests) and live production verification passed on app.crontinel.com

## Current task
All MVP planning features are merged. Local sqlite Feature suite (298 passed) and live `app.crontinel.com` health/auth/ingest smoke checks confirm the merged code is live. Feature 10 (release verification and handoff) is implementation-complete; no further viable implementation task remains in the MVP plan.

## Live worker contract
- Worker name: Crontinel Supervisor T
- Worker runs 24/7
- Health check: every 15 minutes
- Graceful restart: every 6 hours, only at a task boundary, never mid-job
- Morning report: every day at 10:00 Asia/Dhaka
- Morning report includes blockers and human review items
- Always re-read the latest planning files before acting
- After `done`, `needs human review`, or `blocked`, immediately pick the next viable task on the same run
- Do not idle between viable tasks
- If a task is blocked, move it to `needs attention` and capture the blocker clearly
- Coding work should use the repo-local `./claude.sh` launcher in the persistent tmux session when available
- If Claude Code is rate-limited, unavailable, or blocked by persistent network/auth issues, switch to Codex as the fallback
- Implementation should start from an isolated git worktree and feature branch
- No direct commits to `main`
- Review order: Codex first, then Claude Code
- Every task should carry acceptance criteria
- If a blocker cannot be solved locally, escalate it to human review with the reason

## Top impediments
- None. All MVP planning features are merged into `main`, the local sqlite Feature suite (298 tests) is green, and the live `app.crontinel.com` smoke checks (health, login, ingest auth) confirm production rollout.
- Local full-suite verification requires explicit sqlite plus sync queue test env locally because the worktree `.env` points at pgsql with SSL and the local PHP runtime lacks Redis; full sqlite suites pass with that env.

## Working log
- 2026-06-06: captured the always-on supervisor loop, the no-idle rule, the blocker escalation path, and the morning report cadence.
- 2026-06-06: confirmed live cron schedules for Supervisor T, health check, graceful restart, and morning blocker report.
- 2026-06-06: completed Stage 1 baseline validation and recorded findings in `docs/plans/mvp/baseline-audit.md`.
- 2026-06-06: started Feature 3 in `/Users/ray/Work/crontinel/worktrees/app-mvp-org-overview` on branch `feature/mvp-org-overview`.
- 2026-06-06: `DashboardTest` now passes with warnings once `APP_KEY` is supplied in the test command.
- 2026-06-06: completed implementation definitions for Features 3-10 and checked all MVP task sheets.
- 2026-06-06: opened PR 238 for Feature 3 organization dashboard overview; CI is passing on commit `6546dc7`.
- 2026-06-06: opened PR 239 for Feature 4 app connection setup; CI is passing on commit `475e3e7`.
- 2026-06-06: opened PR 240 for Feature 5 alert endpoint management; CI is passing on commit `ca371f5`.
- 2026-06-06: opened PR 241 for Feature 6 cron trigger execution; CI is passing on commit `d2994c2`.
- 2026-06-06: opened PR 242 for Feature 7 execution history and retries on commit `2ddfeb0`; local full suite passes, GitHub checks were not reported for the branch.
- 2026-06-06: opened PR 243 for Feature 8 failure alerts and rules on commit `4ecd033`; targeted alert suite passes, full local suite is blocked by one unrelated `DashboardTest` escaped-apostrophe assertion failure.
- 2026-06-06: opened PR 244 for Feature 9 package family guidance on commit `09fe2b0`; targeted app/onboarding suite passes.
- 2026-06-06: refreshed release handoff state; PR 240 is merged, PR 242 has passing CI, and PRs 243/244 remain stacked with no GitHub checks reported.
- 2026-06-06: resolved PR 239 merge conflict against main, fixed the dashboard escaped-apostrophe assertion, and verified PR 239 CI passing on commit `f474d2e`.
- 2026-06-06: applied the dashboard escaped-apostrophe assertion fix to PR 243 on commit `570bacf`, merged it into PR 244 on commit `a79419f`, and verified targeted sqlite suites for both stacked branches; GitHub still reports no checks for stacked PRs 243/244.
- 2026-06-06: verified full local sqlite suites for PR 243 (`570bacf`) and PR 244 (`a79419f`) with `APP_KEY`, `DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:`, and `QUEUE_CONNECTION=sync`; both passed 296 tests. GitHub still reports no checks for stacked PRs 243/244.
- 2026-06-06: attempted live PR/check refresh, but GitHub CLI auth was invalid for HarunRRayhan (`gh pr list` HTTP 401) and `git fetch origin main` was blocked without credentials; runtime state moved to needs-attention for auth restoration while prior PR review items remain.
- 2026-06-08: GitHub auth is restored; `gh pr list`, `gh pr view`, `git fetch`, and a fast-forward pull of app `main` succeeded. PRs 238, 239, 241, and 242 are open, clean, and have passing CI; PRs 243 and 244 are open and clean but remain stacked, so GitHub checks are not reported under the current `pull_request.branches: [main]` CI trigger.
- 2026-06-08: PRs 238, 239, 241, and 242 were merged. PRs 243 and 244 were closed as merged into feature branches, but their Feature 8/9 changes were still ahead of `main`; merged latest `main` into `feature/mvp-failure-alerts`, resolved conflicts by keeping the main app connection/test flow, verified `APP_KEY=base64:4sE5TTcUUpxjSId76yWmlzNEhEVgflvAGoTe57XmiDc= DB_CONNECTION=sqlite DB_DATABASE=:memory: QUEUE_CONNECTION=sync php artisan test --testsuite=Feature` with 297 passing tests, pushed the branch, opened PR 246 against `main`, and confirmed GitHub CI passed.
- 2026-06-10: detected a Pint `class_attributes_separation` style issue on `tests/Feature/AlertEvaluatorTest.php` from the latest re-run of PR 246 CI, fixed it on the feature branch (`007590e`), pushed the fix, verified GitHub CI passed on the rebuilt PR head, and squash-merged PR 246 into `main` as `19c1a10 feat: ship MVP failure alerts and package guidance (#246)`. Fast-forwarded the local `app` `main` to `19c1a10`, re-ran the local sqlite Feature suite (298 tests passing), and verified live `app.crontinel.com` health (`{"ok":true}` on `/up`), login, and ingest auth (`401 Invalid API key` without key) endpoints. Feature 10 release verification and handoff is now implementation-complete; the MVP planning path has no remaining viable implementation task.

## Implementation handoff
- First implementation task: Feature 3, organization overview and onboarding guidance.
- Primary references: `docs/plans/mvp/baseline-audit.md`, `docs/plans/mvp/features/03-org-overview-and-onboarding.md`, and `docs/plans/mvp/tasks/03-org-overview-and-onboarding.md`.
- Code target: `/Users/ray/Work/crontinel/app`.
- Workflow: isolated worktree plus feature branch, PR-only, Codex review first, Claude Code review second, then live verification.

## Notes
- Keep this file in sync with `master-plan.md`, `progress.md`, and `questions.md`.
- The live runtime state should stay in `docs/plans/mvp/runtime/`.
