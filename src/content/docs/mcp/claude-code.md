---
title: Claude Code Setup
description: Add the Crontinel MCP server to Claude Code so the assistant can read cron, queue, and Horizon status without leaving the editor.
---

:::note
The Crontinel SaaS is now in early access. [Create a free account](https://app.crontinel.com/login) to get started.
:::

## 1. Add the hosted server

```bash
claude mcp add --transport http crontinel https://app.crontinel.com/mcp
```

## 2. Sign in

Run `/mcp` in Claude Code, pick `crontinel`, and sign in. The OAuth consent screen shows which apps and scopes the connection gets. The default scopes are read-only.

## 3. Check the tools

The Crontinel tools appear in Claude Code's tool list. Manage or revoke the connection at [/settings/ai-connections](https://app.crontinel.com/settings/ai-connections).

### Legacy: stdio package with an app API key

The `@crontinel/mcp-server` package proxies to the older `app.crontinel.com/api/mcp` endpoint with an app API key (the key your jobs send data with, not a scoped MCP key). It has a different tool set. Use it only if you cannot use the hosted server:

```json
{
  "mcpServers": {
    "crontinel": {
      "command": "npx",
      "args": ["-y", "@crontinel/mcp-server"],
      "env": {
        "CRONTINEL_API_KEY": "your-app-key"
      }
    }
  }
}
```

## 4. Try it

Ask Claude Code:

- "Did my cron jobs run last night?"
- "Which monitors are failing?"
- "Show me open incidents"

## Troubleshooting

If tools don't appear, run `/mcp` and check that the `crontinel` server is connected and signed in.

For the legacy stdio package, check that Node.js 18+ is installed (`node --version`). A wrong API key shows `401 Unauthorized` in the MCP server output.

## What Claude Code can read

Once connected, Claude Code calls the tools listed on [Available Tools](/mcp/tools/): monitors, runs, deploys, incidents and their evidence on the hosted server. Ordinary reads from your own assistant do not spend hosted AI starts (see [billing and plans](/billing/) for the allowances).

The [MCP overview](/mcp/overview/) explains the hosted server, its scopes, and the legacy stdio package.

## Related

- [MCP overview](/mcp/overview/)
- [Agent guide](/agent/guide/) if you want cloud-triggered commands on your own server
- [Security](/security/) for how keys and scopes should be handled
- [Troubleshooting](/troubleshooting/) for connection and 401 errors
