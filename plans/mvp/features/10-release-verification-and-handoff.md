# Feature 10: Release verification and handoff

**Stage:** 4 — Package rollout and release

**Goal:** Make the branch, review, deployment, and live-verification path repeatable.

## Task group A: Branch and review flow
- Enforce isolated worktree plus feature branch before implementation.
- Keep Codex review first and Claude Code review second.
- Keep the no-direct-commit-to-main rule explicit in the plan.

**Acceptance criteria**
- Every implementation task has a branch and review path.
- The review order is unambiguous.

## Task group B: Deploy and verify
- Define the live deployment verification step before marking work done.
- Keep blockers and human-review escalations visible.
- Make the handoff clear for the next worker or human reviewer.

**Acceptance criteria**
- Live verification is part of the release checklist.
- Blockers are escalated instead of hidden.

## Implementation definition

### Branch/worktree rule
- Never implement directly in `main` or the primary checkout.
- Create an isolated worktree and feature branch for each app, landing, docs, or package repo change.
- Use the repo-local root for each change:
  - App: `/Users/ray/Work/crontinel/app`.
  - Landing: `/Users/ray/Work/crontinel/landing`.
  - Docs planning repo: `/Users/ray/Work/crontinel/docs`.
  - Packages: `/Users/ray/Work/crontinel/laravel`, `/node`, `/python`, or root PHP package as needed.
- Do not mix unrelated repos in one branch unless the task explicitly needs a coordinated release.

### Coding path
- Use repo-local `./claude.sh` through persistent tmux when available.
- If Claude Code is rate-limited, unavailable, or blocked by auth/network, switch to Codex fallback and record the blocker.
- Keep secrets out of files, logs, and PR descriptions.

### Review order
1. Codex review first.
2. Claude Code review second.
3. Resolve review findings.
4. Open PR against `main`.
5. Merge only after review/approval path is satisfied.

### Verification checklist
- Run relevant local tests/builds before PR.
- After deployment, verify the live result before marking the task done.
- App verification should include a real route/browser/API check for the changed surface.
- Landing verification should include build and live page check.
- Package verification should include package tests or at least a minimal install/import/smoke test.
- If live deployment cannot be verified because of environment or credential limits, move the task to needs attention with the exact blocker.

### Handoff format
- Record current branch/worktree.
- Record PR URL or state if available.
- Record tests/builds run and their result.
- Record live verification evidence.
- Record blockers and human-review items separately.
- Update `docs/plans/mvp/runtime/supervisor-t.json` with current item, last completed task, blocker state, and refresh time.

### Worker cadence to preserve
- Supervisor T runs every 15 minutes.
- Health check runs every 15 minutes.
- Graceful restart runs every 6 hours and only at task boundaries.
- Morning blocker report runs at 10:00 Asia/Dhaka and includes blockers plus human-review items.
- If no viable task remains, final output should be exactly `[SILENT]`.