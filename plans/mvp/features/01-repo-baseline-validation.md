# Feature 1: Repo baseline validation

**Stage:** 1 — Foundation, workspace, and baseline

**Goal:** Verify what is already present in the repo so the MVP plan only covers missing work.

## Task group A: Baseline discovery
- Verify the existing dashboard, billing, organization, API-key, alert endpoint, and package-connection surfaces.
- Record which parts are baseline and which parts are still MVP gaps.
- Keep the plan honest about what is already shipped.

**Acceptance criteria**
- Baseline surfaces are named explicitly in the plan.
- MVP gaps are separated from existing app coverage.

## Task group B: Repo boundary check
- Confirm the actual repo root and any nested app boundaries.
- Confirm where future work should land before coding starts.
- Note any repo-specific constraints that affect implementation order.

**Acceptance criteria**
- The workspace points at the correct repo boundary.
- The plan tells implementers where to work first.