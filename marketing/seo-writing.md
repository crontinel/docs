---
title: SEO Writing Guidelines
description: Guidelines for writing SEO content for Crontinel — keyword strategy, structure, internal linking, and content quality standards.
---

This document covers how to write SEO content for Crontinel's landing site. It applies to blog posts, comparison pages (VS), use-case pages, and integration pages.

---

## Audience and tone

**Primary audience**: Laravel developers responsible for production operations. They know PHP and Laravel well. They are skeptical of marketing copy and respond to concrete, specific information.

**Tone**: Direct, technical, no filler. Write like a senior developer explaining something to a teammate. Skip adjectives like "powerful", "robust", "seamless". Show the thing — don't describe it.

**What works**: code samples, failure scenarios, comparison tables, specific numbers (thresholds, durations, error codes).  
**What doesn't**: feature lists without context, generic "monitoring is important" intros, buzzwords.

---

## Keyword strategy

### Primary keyword per page

Each page targets one primary keyword phrase. The primary keyword should appear:

- In the `<title>` tag (naturally, not stuffed)
- In the H1
- In the first paragraph
- In at least one H2 subheading
- In the URL slug

### Keyword selection

Target keywords that reflect real developer search intent:

| Good targets | Why |
|---|---|
| `laravel horizon paused alert` | Problem-specific, high intent |
| `monitor laravel queue depth` | Feature-specific, actionable |
| `crontinel vs cronitor` | Comparison intent, brand capture |
| `laravel cron job not running` | Pain point, high volume |
| `queue depth monitoring laravel` | Technical, low competition |

Avoid:
- Generic terms (`cron monitoring`, `job monitoring`) — too broad, too competitive
- Non-Laravel terms — wrong audience
- Features without context (`scheduled task alerts`) — not how developers search

### Long-tail phrases

Each page should naturally include several long-tail variants of the primary keyword. These come from using technical language correctly — they don't need to be engineered.

Example: a page targeting `laravel horizon monitoring` will naturally include:
- "Horizon supervisor paused"
- "php artisan horizon:terminate"
- "queue worker not processing jobs"
- "Redis connection Horizon"

These arise from accurate technical writing, not keyword insertion.

---

## Page structure

### Required elements for every page

1. **H1**: Clear, specific, includes primary keyword. Under 65 characters.
2. **Opening paragraph** (50–100 words): State the problem and what the page covers. No preamble. First sentence should be substantive.
3. **H2 sections**: 3–6 major sections. Each H2 should be a self-contained answer to a sub-question.
4. **Code example**: At least one code block per page (config, CLI commands, or PHP snippet). Real code, not pseudocode.
5. **Comparison table**: For VS pages and feature-heavy use-case pages. Keeps the page scannable.
6. **CTA at the end**: Install command + link to register. Not a sales pitch — just the next logical step.

### Section length

- **Opening paragraph**: 50–100 words. Dense, no filler.
- **H2 sections**: 100–300 words each. If a section needs more, split it with an H3.
- **Total page length**: 700–1500 words. Under 700 is thin. Over 2000 starts to ramble.

### URL slugs

Use the content collection file names as slugs. Follow the pattern already in use:

- VS pages: `crontinel-vs-{competitor}` → `/vs/crontinel-vs-cronitor`
- Use cases: descriptive phrase → `/use-cases/laravel-cron-monitoring`
- Blog: date-prefixed or descriptive → `/blog/why-cron-jobs-fail-silently`
- Integrations: tool name → `/integrations/slack`

No keyword stuffing in slugs. Lowercase, hyphen-separated.

---

## Internal linking

Internal links pass authority and help Google understand site structure. Every page should have:

### Minimum internal link requirements

| Page type | Minimum inbound links | Where to link out |
|---|---|---|
| Blog post | 2 (from other blog posts or use-cases) | 1–2 use-cases, 1 VS page if relevant |
| VS page | 2 (from blog posts or index) | pricing page, relevant use-case |
| Use-case page | 2 (from blog posts) | relevant integration, pricing page |
| Integration page | 1 (from integrations index) | relevant use-case |

### Link text rules

- Use descriptive anchor text: `Laravel Horizon monitoring` not `click here`
- Match anchor text to the target page's primary keyword when possible
- Don't repeat the same anchor text more than twice site-wide for the same destination

### Hub pages to link to frequently

These pages should receive internal links from most content pages:

- `/pricing` — link from any mention of plan features or limits
- `/vs` (comparisons index) — link when comparing to alternatives
- `/integrations` — link from any mention of alert channels
- `/docs` — link from any mention of installation or configuration

---

## Content quality checklist

Before publishing any SEO page:

- [ ] Primary keyword in H1, first paragraph, and at least one H2
- [ ] No passive voice in the first two paragraphs
- [ ] At least one code block (real commands or config, not pseudocode)
- [ ] All claims are specific — no "quickly", "easily", "seamlessly"
- [ ] Comparison table included if comparing features (VS pages and some use-cases)
- [ ] Internal links to at least 2 other Crontinel pages
- [ ] CTA at the end with install command
- [ ] `title` and `description` frontmatter set (under 65 and 160 characters respectively)
- [ ] `date` frontmatter set (affects sitemap priority)

---

## Blog post structure

Blog posts follow the same rules but are more flexible in tone. The best-performing patterns for technical developer audiences:

### "Why X happens" posts

Target: `why laravel cron jobs fail silently`  
Structure: explain the failure mechanism → show what's missing → show what monitoring catches it  
Length: 800–1200 words

### "How to" posts

Target: `how to monitor laravel horizon`  
Structure: what you're monitoring → why it matters → step-by-step setup → what alerts to configure  
Length: 700–1000 words

### Incident story posts

Target: `laravel queue stopped processing jobs`  
Structure: incident scenario → what the dashboard showed → root cause → how to prevent it  
Length: 600–900 words. These convert well because they match real search queries from developers actively debugging.

---

## VS page structure

Comparison pages have a specific structure that performs well:

1. **Opening**: What the competitor does well. Be fair. Developers know when you're being disingenuous.
2. **The gap**: What the competitor doesn't cover for Laravel specifically. Be concrete.
3. **What Crontinel covers**: The Laravel-specific features that fill the gap.
4. **Feature comparison table**: Side-by-side capabilities. Include rows where the competitor wins.
5. **When to use each**: Honest guidance. If they're not competing, say so.
6. **Install CTA**: End with the two-command install.

Do not write VS pages that are entirely negative about the competitor. Developers will distrust the whole page if it reads like a hit piece. Include at least one genuine strength of the competitor.

---

## Avoiding thin content

Pages under 700 words with no code samples, no comparison tables, and no specific technical detail are treated as thin content and rank poorly. If you can't write 700 substantive words about a topic, it's probably not a standalone page — fold it into a related page instead.

Signs a page is too thin:
- Every sentence could apply to any monitoring tool (not Laravel-specific)
- No code samples, no configuration examples
- The primary keyword appears only once
- Sections are one paragraph each with no depth

When in doubt, combine two thin topics into one well-developed page.
