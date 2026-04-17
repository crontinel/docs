# Status Page Feature — Research Notes

## What We Have Now
- Gatus running at `gatus-production-028e.up.railway.app` 
- Serving status page UI at `/` (HTML frontend)
- Config stored in `config.yaml` at repo `crontinel/status-page`
- 2 endpoints monitored: `app.crontinel.com/up` + `crontinel-production.up.railway.app/up`
- Railway SSL cert for `status.crontinel.com` still validating

## Multi-Tenant Status Page Architecture

### Option A: Gatus Groups (Simplest, Recommended for MVP)
- Gatus supports **groups** — each group = one user's status page
- All user endpoints in one Gatus config file
- Access via `/{group}` path or query param
- Pros: single deployment, built-in UI, minimal ops
- Cons: config file grows with users, needs rebuild on change

### Option B: Gatus as Monitoring Engine + Custom UI
- Gatus monitors endpoints, stores results (in-memory or file)
- Custom frontend reads results from Gatus API + renders branded pages
- Each user gets their own subdomain: `{user}.status.crontinel.com`
- Pros: full branding control, dynamic, scalable
- Cons: more dev work, need to proxy/relay results

### Option C: Gatus per User (Containerized)
- Each user gets their own Gatus instance (spawned on demand)
- Railway handles container lifecycle
- Pros: fully isolated, no shared state risk
- Cons: expensive, complex ops, hundreds of containers

### Option D: Build Status Page System from Scratch
- Our own monitoring + alerting engine
- Supabase stores endpoint configs + results
- Custom frontend renders status pages
- Pros: complete control, differentiate from competitors
- Cons: significant engineering effort

## Recommended Approach
**Start with Option B (Gatus + Custom UI)**
- Use Gatus v5 REST API to fetch endpoint results
- Build lightweight custom status page UI (Astro, same stack as landing)
- Each user gets `/{username}/{slug}` or subdomain
- Store page configs in Supabase (our existing DB)
- Gatus config dynamically generated from DB

## Key Implementation Steps
1. Expose Gatus API externally (currently internal only)
2. Build `/status-pages/{id}` endpoint on our app to proxy Gatus data
3. Create status page records in Supabase: name, slug, endpoints, brand settings
4. Build Astro component for rendering status page with our branding
5. User flow: create status page → add endpoints → embed/widget/public URL

## Branding Options
- **Crontinel-hosted**: `status.crontinel.com/{user}/{slug}` (free/pro)
- **White-label**: user points `status.theirdomain.com` CNAME to us (Pro/Enterprise)

## Competitive Positioning
- Uptime Kuma: self-hosted only, no managed option
- Better Uptime / Cachet: paid, good but no Laravel integration
- Our advantage: native Laravel cron/Horizon monitoring + status pages in one place

## Gatus v5 API Endpoints (to verify)
- `GET /` — HTML status page (built-in frontend)
- `GET /api/v1/status` — JSON status (unclear path, needs testing)
- `GET /api/v1/endpoints` — endpoint list
- `GET /api/v1/health` — health check
Note: Gatus v5 has limited public API — may need to scrape HTML or fork for custom API

## Cost Estimate
- Gatus: free, open-source (MIT)
- Railway: ~$5-10/mo for status page service (1 small container)
- Supabase: free tier OK for <50 status pages, $25/mo for Pro
