---
title: AI Agent Monitoring
description: Monitor AI agent runs, tool call success rates, token usage, loop detection, and cost with Crontinel
---

# AI Agent Monitoring

Crontinel can monitor AI agents built with the MCP server, tracking runs, tool calls, costs, and failure patterns.

## What gets monitored

| Metric | Description |
|---|---|
| **Agent runs** | Each invocation of an AI agent |
| **Tool call success rate** | Percentage of tool calls that succeeded |
| **Token usage** | Input + output tokens per run |
| **Cost** | Estimated cost per run (based on model pricing) |
| **Loop detection** | Repeated tool call patterns indicating infinite loops |
| **Failure rate** | Percentage of runs that ended in error |

## Setup

### 1. Install the MCP server

```bash
npm install -g @crontinel/mcp-server
```

### 2. Configure your agent

Point your AI agent to the Crontinel MCP server:

```json
{
  "mcpServers": {
    "crontinel": {
      "command": "npx",
      "args": ["-y", "@crontinel/mcp-server"]
    }
  }
}
```

Set your API key:

```bash
export CRONTINEL_API_KEY="your_api_key"
```

### 3. Instrument your agent

Use the MCP tools to report agent activity:

```typescript
import { CrontinelMCP } from "@crontinel/mcp-server";

const crontinel = new CrontinelMCP({
  apiKey: process.env.CRONTINEL_API_KEY,
  appName: "order-processing-agent",
});

// Report an agent run starting
const runId = await crontinel.agentRunStart({
  agentName: "order-processing",
  model: "gpt-4o",
  inputTokens: 1200,
});

// Report tool calls as they happen
await crontinel.toolCall({
  runId,
  tool: "fetch-order",
  inputTokens: 300,
  outputTokens: 150,
  success: true,
  durationMs: 420,
});

await crontinel.toolCall({
  runId,
  tool: "update-inventory",
  inputTokens: 200,
  outputTokens: 80,
  success: false,
  error: "inventory service unavailable",
  durationMs: 1200,
});

// Report the run complete
await crontinel.agentRunEnd({
  runId,
  outputTokens: 340,
  success: false,
  error: "inventory update failed",
});
```

## Monitoring loop detection

Repeated tool calls on the same tool within a short window indicate a potential infinite loop:

```typescript
// Crontinel auto-detects loops after 5+ repeated calls
await crontinel.toolCall({ runId, tool: "search-db", success: true });
await crontinel.toolCall({ runId, tool: "search-db", success: true });
await crontinel.toolCall({ runId, tool: "search-db", success: true });
// → Crontinel fires a "loop_detected" alert after 5 attempts
```

## Dashboard

View all agent metrics at `https://app.crontinel.com` — the **Agents** tab shows:

- **Run history** — every agent run with duration, token count, cost estimate
- **Tool call map** — which tools fail most often
- **Loop incidents** — when loops were detected
- **Cost trend** — daily/weekly cost by agent

## Alerting

Set up alerts for:

- **Failure rate spike** — when >10% of runs fail in an hour
- **Loop detected** — when an agent loops 5+ times on the same tool
- **Cost threshold** — when an agent exceeds a daily cost budget
- **Tool failure** — when a specific tool fails repeatedly

Configure alerts via the dashboard or the `CRONTINEL_ALERT_*` env vars.

## Pro feature

AI agent monitoring is available on the **Pro plan**. See [Pricing](/pricing).
