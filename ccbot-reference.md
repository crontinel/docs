# CCBot Reference — Crontinel Project

## ⚠️ IMPORTANT RULES
1. **IF STUCK, ASK before trying alternatives**
2. **Store credentials only in project-scoped files** — NOT in global `~/.openclaw/secrets/`
3. **Save important things in memory in CAPS**

## Secrets Locations
| Secret | Location |
|--------|----------|
| Supabase password | `~/Work/crontinel/.secrets/supabase.env` → `SUPABASE_DB_PASSWORD` |
| Supabase connection configs | `docs/ccbot-supabase-configs.md` |
| Railway token | `~/.railway/credentials.json` |
| GSC service account | `~/.openclaw/secrets/gsc-service-account.json` |

## Database Status
**Neon: ACTIVE** — free tier, external connections work. See `docs/ccbot-supabase-configs.md`

**Supabase: DEPRECATED** — free tier blocks external connections. DO NOT USE.

**For any new database work:** use Neon (free tier supports external) or Railway Postgres

## Project Structure
- `~/Work/crontinel/app/` — Laravel SaaS app
- `~/Work/crontinel/landing/` — Astro landing page
- `~/Work/crontinel/status/` — Gatus config (to be deprecated)
- `~/Work/crontinel/docs/` — Documentation
- `~/Work/crontinel/.secrets/` — Project secrets (gitignored)

## Memory
Before starting work, check:
- `~/Work/crontinel/MEMORY.md` — long-term memory
- `~/Work/crontinel/memory/2026-04-17.md` — today's notes
