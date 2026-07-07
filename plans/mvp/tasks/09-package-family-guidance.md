# Task Sheet: Package family guidance

**Feature:** 9 — Package family guidance
**Stage:** 4 — Package rollout and release

## Files to inspect
- `docs/plans/mvp/master-plan.md`
- `docs/plans/mvp/research.md`
- `app/resources/views/onboarding/install.blade.php`
- `app/resources/views/onboarding/app.blade.php`
- `app/resources/views/apps/index.blade.php`
- `app/resources/views/apps/show.blade.php`

## To do
- [x] Define the Laravel, Node, Python, PHP, and other-repo tabs.
- [x] Keep the general tab first, then family-specific guidance.
- [x] Capture the copy-paste snippets and short explanations required for each path.
- [x] Define the order for package support rollout.
- [x] Keep Laravel, Node, and Python as the highest-priority families.
- [x] Leave room for the rest of the package ecosystem.
- [x] Keep the guidance consistent across app and onboarding views.

## Completion note
- 2026-06-06: Feature 9 implementation definition is recorded in `docs/plans/mvp/features/09-package-family-guidance.md`, including tab order, package surface paths, rollout order, and verification caveats.

## Implementation steps
1. Review the package priority decisions in `docs/plans/mvp/master-plan.md` and the competitor notes in `docs/plans/mvp/research.md`.
2. Inspect `app/resources/views/onboarding/install.blade.php` and `app/resources/views/onboarding/app.blade.php` to determine where the general install guidance should appear.
3. Inspect `app/resources/views/apps/index.blade.php` and `app/resources/views/apps/show.blade.php` to see how the family-specific tabs should be surfaced from the app surface.
4. Define the tab order as general first, then the highest-priority families, then the remaining package families.
5. Record the minimum copy-paste snippets and short explanations required for each family.
6. Make sure Laravel, Node, and Python stay at the top of the rollout order.
7. Leave a note that the rest of the package ecosystem can be filled in later without changing the overall navigation pattern.

## Acceptance criteria
- The package guidance works for multiple families.
- The general tab remains the first orientation point.
- The rollout order is explicit.
- The plan honors the package priority decisions already collected.
- The tab pattern can scale to the rest of the ecosystem.
