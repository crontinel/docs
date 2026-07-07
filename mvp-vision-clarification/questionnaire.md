# MVP Vision — Questionnaire

## Section A: Core Identity (who are we?)

### Q1. What is the ONE job Crontinel should do better than anyone else?
Options:
- a) **Monitor** — tell me if my cron job ran, how long it took, whether it failed. Ping/heartbeat style.
- b) **Trigger** — let me schedule and run commands on my server from the cloud. Agent daemon style.
- c) **Both** — the full two-way tunnel. Monitor + trigger.
- d) Something else: _________

### Q2. Who is the primary user?
- a) Laravel developer
- b) General DevOps / sysadmin
- c) Node.js / Python developer
- d) AI agent / automated system that needs to trigger jobs
- e) All of the above

### Q3. What problem hurts most right now?
- a) "My cron job failed and I didn't know" (silent failures)
- b) "I need to remotely trigger a job on my server" (manual SSH / no cloud trigger)
- c) "I have no history of what ran and what broke" (no observability)
- d) "I'm paying too much for other tools" (cost)
- e) "I need to migrate from Cronhub before June 30" (urgency)

## Section B: Scope & Trade-offs

### Q4. Should the MVP focus on ONE direction first?
- a) Monitoring only (package→cloud). Ship the simplest ping/alert system.
- b) Triggering only (cloud→package). Novel, differentiated.
- c) Both simultaneously. Full vision from day one.

### Q5. Do we need the agent daemon in MVP?
(The agent is a process users run on their server to receive commands from Crontinel cloud)
- a) Yes — without it we're just another ping monitor
- b) No — monitoring + alerts alone is enough value for MVP
- c) Later — ship monitoring first, add agent in v2

### Q6. What about the Cronhub migration window? (5 days left)
- a) Priority — publish "Cronhub alternative" page immediately
- b) Low priority — focus on product, not marketing
- c) Do both in parallel

## Section C: Package Strategy

### Q7. Which packages matter for MVP?
- a) Laravel only (our core audience)
- b) Laravel + Node (two biggest ecosystems)
- c) All built packages (Laravel, Node, Python, Go, Rust, .NET)

### Q8. Is PyPI publishing worth pursuing?
(Blocked — crontinel org not approved on PyPI)
- a) Skip — Python users can install from source
- b) Invest time to get approved and publish
- c) Not now — revisit post-MVP

## Section D: Differentiation

### Q9. What makes Crontinel different from Healthchecks.io / Cronitor / etc.?
- a) The trigger direction (cloud→package agent)
- b) Laravel-first developer experience
- c) Combined monitoring + triggering
- d) Open-source ecosystem (multiple SDKs)
- e) Price
- f) Not sure yet

### Q10. Does "Laravel-first" matter or should we be framework-agnostic?
- a) Laravel-first — that's our strength
- b) Framework-agnostic — wider market
- c) Laravel-first for MVP, expand later
