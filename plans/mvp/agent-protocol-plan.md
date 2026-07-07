# Crontinel Agent Protocol — Bidirectional Cron Packages

> **Concept:** Each Crontinel package becomes a two-way agent — it reports cron results TO the cloud AND receives trigger commands FROM the cloud to execute locally.

## Architecture

```
Cloud (app.crontinel.com)
  │
  ├─ Trigger API — schedules & sends commands
  ├─ Agent registry — tracks connected agents
  ├─ SSE stream — pushes commands to agents
  └─ Result ingest — receives execution results

Agent (user's server, embedded in package)
  │
  ├─ Connects to cloud via SSE
  ├─ Receives "run command" instructions
  ├─ Executes locally (shell, artisan, script)
  ├─ Reports results via HTTP POST
  └─ Sends heartbeats / handles reconnects
```

## Protocol

- **Receive:** SSE stream — cloud pushes `{command_id, command, env, timeout}` to agent
- **Report:** HTTP POST — agent sends `{command_id, status, exit_code, output, started_at, finished_at, duration_ms}`
- **Auth:** API key in SSE connection + in report POST
- **Heartbeat:** Agent pings every 60s — cloud marks agent dead after 3 missed heartbeats
- **Reconnect:** Agent retries with exponential backoff on disconnect

## Stages

### Stage 1: Core Protocol + Laravel Agent (reference implementation)

- **Feature 1: Protocol design & cloud API** — design spec, DB schema, cloud endpoints
- **Feature 2: Laravel agent package** — artisan command, SSE client, executor, reporter
- **Feature 3: End-to-end verification** — cloud → agent → execute → report → dashboard

### Stage 2: Port to Other Packages

- **Feature 4: Node.js agent** — npx command, SSE client, executor
- **Feature 5: Python agent** — CLI command, SSE client, executor
- **Feature 6: Go / Rust / .NET agents** — binary-based agents

### Stage 3: Publish & Launch

- **Feature 7: Package publishing** — npm, Packagist, PyPI, Go module
- **Feature 8: Dashboard trigger UI** — schedule/manage triggers
- **Feature 9: Launch readiness** — quickstarts, docs, landing page update
