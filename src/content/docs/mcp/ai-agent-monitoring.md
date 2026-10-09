---
title: AI Agent Monitoring
description: Planned, and not in a released package yet. This page previews tracking agent runs, tool calls, and cost after the feature ships.
---

# AI Agent Monitoring

> 🚧 **Coming soon — not yet available.** This page describes a planned feature. The `CrontinelMCP` class, the `agentRunStart` / `toolCall` / `agentRunEnd` methods, cost tracking, and loop detection described below do not exist in any released Crontinel package yet. Nothing on this page is callable today — treat the snippets as a preview of the intended design, not working code.

Crontinel plans to monitor AI agents built with the MCP server, tracking runs, tool calls, costs, and failure patterns.

## What gets monitored (planned)

| Metric | Description |
|---|---|
| **Agent runs** | Each invocation of an AI agent |
| **Tool call success rate** | Percentage of tool calls that succeeded |
| **Token usage** | Input + output tokens per run |
| **Cost** | Estimated cost per run (based on model pricing) |
| **Loop detection** | Repeated tool call patterns indicating infinite loops |
| **Failure rate** | Percentage of runs that ended in error |

## Intended setup (not yet implemented)

The steps below describe how this feature is expected to work once it ships. None of this exists yet — there is no `@crontinel/mcp-server` agent-monitoring API, and these snippets will not run.

### 1. Install the MCP server

The MCP server itself already exists for other purposes; agent-monitoring support would be added to it in a future release.

### 2. Configure your agent

Conceptually, your agent would point at the Crontinel MCP server the same way it points at any other MCP server today, plus an API key for reporting.

### 3. Instrument your agent (conceptual — not real API)

The design under consideration is a small client with `agentRunStart` / `toolCall` / `agentRunEnd` calls, illustrated here only to convey the shape of the idea:

```typescript
// CONCEPTUAL — this class and these methods do not exist yet.
// import { CrontinelMCP } from "@crontinel/mcp-server";
//
// const crontinel = new CrontinelMCP({
//   apiKey: process.env.CRONTINEL_API_KEY,
//   appName: "order-processing-agent",
// });
//
// // Report an agent run starting
// const runId = await crontinel.agentRunStart({
//   agentName: "order-processing",
//   model: "gpt-4o",
//   inputTokens: 1200,
// });
//
// // Report tool calls as they happen
// await crontinel.toolCall({
//   runId,
//   tool: "fetch-order",
//   inputTokens: 300,
//   outputTokens: 150,
//   success: true,
//   durationMs: 420,
// });
//
// // Report the run complete
// await crontinel.agentRunEnd({
//   runId,
//   outputTokens: 340,
//   success: false,
//   error: "inventory update failed",
// });
```

## Loop detection (planned)

The idea is that repeated tool calls on the same tool within a short window would indicate a potential infinite loop, and Crontinel would fire a `loop_detected` alert after a configurable number of repeats. No such detection exists today.

## Dashboard (planned)

Once built, agent metrics would appear at `https://app.crontinel.com` under an **Agents** tab, showing run history, a tool-call failure map, loop incidents, and cost trends. This tab does not exist yet.

## Alerting (planned)

Future alert types under consideration: failure-rate spikes, loop detection, cost thresholds, and repeated tool failures. None of these alert types are configurable today.

## Status

AI agent monitoring is unreleased. It is not available on any plan, including Pro. Follow [Pricing](https://crontinel.com/pricing/) and the changelog for updates on when this ships.
