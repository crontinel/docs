# Crontinel MVP Progress Tracker

**Status:** All MVP planning features (3-10) are merged into `main`; PR 246 squash-merged as `19c1a10` with local sqlite Feature suite (298 tests) and live `app.crontinel.com` verification passing

**Summary**
- Stages complete: 4 / 4 planning definitions
- Features complete: 10 / 10 planning definitions
- Tasks complete: 20 / 20 planning task groups

## Current focus
- All MVP planning features are merged; Feature 10 release verification and handoff is implementation-complete.
- No further viable implementation task remains in the MVP plan. New MVP-scope work should be filed as a new planning card and routed through the CT Kanban board.
- Future work continues to use the feature-branch/worktree workflow.

## Stage 1 status
- Feature 1: repo baseline validation — complete
- Feature 2: worker contract and progress sync — complete

## Stage 2 status
- Feature 3: organization overview and onboarding guidance — PR 238 merged
- Feature 4: app creation, API key generation, and connection setup — PR 239 merged
- Feature 5: alert endpoint management and alert configuration — PR 240 merged, CI passed

## Stage 3 status
- Feature 6: cron trigger execution — PR 241 merged
- Feature 7: execution history and retries — PR 242 merged
- Feature 8: failure alerts and rules — PR 246 merged as `19c1a10`; local sqlite Feature suite (298 tests) and live `app.crontinel.com` verification passing

## Stage 4 status
- Feature 9: package family guidance — included in PR 246, merged as `19c1a10`; local sqlite Feature suite and live verification passing
- Feature 10: release verification and handoff — implementation-complete; local suite and live production checks confirm the merged code

## Progress log
- 2026-06-06: created planning workspace and master plan skeleton
- 2026-06-06: captured first MVP answer; need to confirm whether "Chrome jobs" means cron jobs or browser-based Chrome jobs
- 2026-06-06: confirmed the MVP is about cron jobs
- 2026-06-06: captured the target user segment for MVP planning
- 2026-06-06: captured the core MVP problem and deferred the later-stage routing scenarios
- 2026-06-06: captured the single must-have MVP feature: triggering a cron job
- 2026-06-06: captured MVP out-of-scope item: status space
- 2026-06-06: captured MVP success criteria around cloud cron execution and package connectivity
- 2026-06-06: researched UptimeRobot, Cronitor, and cron-job.org for feature emphasis
- 2026-06-06: captured configurable failure alerts via email or webhooks as part of MVP scope
- 2026-06-06: captured that the MVP should include some level of execution history
- 2026-06-06: captured that history should include a basic one-line title and a full log
- 2026-06-06: captured that retry behavior for failed cron jobs is a core MVP function
- 2026-06-06: captured that multiple existing cron packages need to be updated for Crontinel
- 2026-06-06: captured that Laravel, Node, and Python are the most important package families for MVP
- 2026-06-06: confirmed the app dashboard should include API key generation, endpoints, and connection setup, alongside billing
- 2026-06-06: confirmed the app page should show API key generation, alert endpoint setup, and package connection instructions together
- 2026-06-06: confirmed separate cards are better than a single checklist because they track feature completion better
- 2026-06-06: captured the dashboard recent activity as org-wide across all apps
- 2026-06-06: captured the dashboard app section as list + summary cards, with latest run status and quick actions
- 2026-06-06: captured the empty state CTA as create app plus a short checklist
- 2026-06-06: captured the always-on supervisor loop, 24/7 worker rule, blocker/human-review morning report, 6-hour graceful restart at task boundaries, health-check cron cadence every 15 minutes, and the Claude Code/Codex feature-branch workflow
- 2026-06-06: split the MVP into 4 stages, 10 features, and 20 task groups
- 2026-06-06: expanded the Stage 1 task sheets with more implementation-ready step-by-step detail
- 2026-06-06: expanded the remaining Stage 2-4 task sheets with files to inspect, step-by-step implementation guidance, and acceptance criteria
- 2026-06-06: completed worker contract sync against live cron jobs and marked Stage 1 worker bookkeeping done
- 2026-06-06: completed repo baseline validation and wrote `docs/plans/mvp/baseline-audit.md`
- 2026-06-06: completed implementation definitions for Features 3-10 and checked all MVP task sheets
- 2026-06-06: opened PR 238 for Feature 3 organization dashboard overview; CI passed after billing test stabilization.
- 2026-06-06: opened PR 239 for Feature 4 app/API key/connection setup; CI passed.
- 2026-06-06: opened PR 240 for Feature 5 alert endpoint management; CI passed.
- 2026-06-06: opened PR 241 for Feature 6 cron trigger execution; CI passed after adding trigger metadata/idempotency and stabilizing billing schema/view defaults.
- 2026-06-06: opened PR 242 for Feature 7 execution history and retries; local full suite passed, but GitHub reported no checks for the branch yet.
- 2026-06-06: opened PR 243 for Feature 8 failure alerts and rules; targeted alert suite passed, but local full suite has one unrelated `DashboardTest` escaped-apostrophe assertion failure and GitHub checks are not reported yet.
- 2026-06-06: opened PR 244 for Feature 9 package family guidance; targeted app/onboarding suite passed and GitHub checks are not reported yet.
- 2026-06-06: refreshed release handoff state; PR 240 is merged, PR 242 now has passing CI, and stacked PRs 243/244 still have no GitHub checks reported.
- 2026-06-06: resolved PR 239 merge conflict against main, fixed the dashboard escaped-apostrophe assertion, and verified PR 239 CI passing on commit `f474d2e`.
- 2026-06-06: applied the dashboard escaped-apostrophe assertion fix to PR 243 and merged it into stacked PR 244; local targeted sqlite suites passed for PR 243 and PR 244, but GitHub still reports no checks for the stacked PRs.
- 2026-06-06: verified full local sqlite suites for stacked PR 243 and PR 244 with `QUEUE_CONNECTION=sync`; both passed 296 tests, while GitHub still reports no checks for the stacked PRs.
- 2026-06-06: attempted live PR/check refresh, but GitHub CLI auth for HarunRRayhan was invalid (`gh pr list` HTTP 401) and `git fetch` was blocked without credentials; recorded auth restoration as a needs-attention blocker.
- 2026-06-08: GitHub auth is restored; live PR refresh and `git fetch`/fast-forward pull work again. PRs 238, 239, 241, and 242 are open, clean, and have passing CI; PRs 243 and 244 are open and clean but remain stacked, so GitHub CI is not reported because the workflow only runs for PRs targeting `main`.
- 2026-06-08: PRs 238, 239, 241, and 242 were merged. PRs 243 and 244 were closed as merged into stacked feature branches but their changes were still ahead of `main`, so the remaining Feature 8/9 work was merged with latest `main`, verified locally with the Feature sqlite suite passing 297 tests, pushed, and reopened as main-targeted PR 246 with GitHub CI passing.
- 2026-06-10: detected a Pint `class_attributes_separation` style issue on `tests/Feature/AlertEvaluatorTest.php` from the re-run of PR 246 CI, fixed it on the feature branch (`007590e`), pushed the fix, verified GitHub CI passed on the rebuilt PR head, and squash-merged PR 246 into `main` as `19c1a10 feat: ship MVP failure alerts and package guidance (#246)`. Fast-forwarded the local `app` `main` to `19c1a10`, re-ran the local sqlite Feature suite (298 tests passing), and verified live `app.crontinel.com` health (`{"ok":true}` on `/up`), login (HTTP 200), and ingest auth (`401 Invalid API key` without key) endpoints. The MVP planning path is implementation-complete.

## Next updates
- No further viable implementation task remains in the MVP plan; new work should be filed as a planning card and routed through the CT Kanban board.
