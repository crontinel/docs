# Crontinel Docs

Documentation site for [Crontinel](https://crontinel.com), focused on background job and cron monitoring for Laravel apps. Built with [Astro Starlight](https://starlight.astro.build) and deployed to Cloudflare Pages at [docs.crontinel.com](https://docs.crontinel.com).

## Local development

```bash
npm install
npm run dev      # starts dev server at http://localhost:4321
npm run build    # production build → dist/
npm run preview  # preview the production build locally
```

## Content structure

All docs live under `src/content/docs/`:

| Section | Path | Description |
|---|---|---|
| Getting Started | `introduction.md`, `quick-start.md`, `installation.md` | Onboarding flow |
| Monitors | `monitors/` | Horizon, queue, and cron monitor setup |
| Alerts | `alerts/` | Alert channels and CLI health check |
| MCP Integration | `mcp/` | MCP server overview, Claude Code setup, available tools |
| Reference | `reference/` | Configuration reference and REST API |
| Self-Hosting | `self-hosting.md` | Running Crontinel on your own infrastructure |
| Troubleshooting | `troubleshooting.md` | Common issues and fixes |

To add a page: create a `.md` file in the appropriate folder with a frontmatter `title` and `description`, then add it to the `sidebar` array in `astro.config.mjs`.

## Deploy

Deployed automatically via Cloudflare Pages on push to `main`. The production site URL is configured in `astro.config.mjs` as `https://docs.crontinel.com`.

## Repos

- App: [crontinel/crontinel-app](https://github.com/HarunRRayhan/crontinel-app)
- OSS Laravel package: [crontinel/laravel](https://github.com/crontinel/crontinel)
- PHP library: [crontinel/php](https://github.com/crontinel/php)
- MCP server: [crontinel/mcp-server](https://github.com/crontinel/mcp-server)
- Landing: [crontinel/landing](https://github.com/HarunRRayhan/crontinel-landing)
- Docs (this repo): [crontinel/docs](https://github.com/HarunRRayhan/crontinel-docs)
