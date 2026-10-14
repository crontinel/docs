---
title: Claude Code Setup
description: Add the Crontinel MCP server to Claude Code so the assistant can read cron, queue, and Horizon status without leaving the editor.
---

:::note
The Crontinel SaaS is now in early access. [Create a free account](https://app.crontinel.com/register) to get started.
:::

## 1. Get your API key

Log in to [app.crontinel.com](https://app.crontinel.com), go to your app, and copy the API key.

## 2. Add to Claude Code config

Edit `~/.claude/settings.json` (or use the Claude Code settings UI):

```json
{
  "mcpServers": {
    "crontinel": {
      "command": "npx",
      "args": ["-y", "@crontinel/mcp-server"],
      "env": {
        "CRONTINEL_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## 3. Restart Claude Code

The Crontinel tools will appear in Claude Code's tool list.

## 4. Try it

Ask Claude Code:

- "Did my cron jobs run last night?"
- "What's the queue depth right now?"
- "Is Horizon healthy?"
- "Show me recent alerts"

## Troubleshooting

If tools don't appear, check that Node.js 18+ is installed:

```bash
node --version
```

If the API key is wrong you'll see `401 Unauthorized` in the MCP server output.

## What Claude Code can read

Once connected, Claude Code calls the tools listed on [Available Tools](/mcp/tools/): scheduled jobs and their last runs, queue depth, Horizon state, and recent alerts. Ordinary reads from your own assistant do not spend hosted AI starts (see [billing and plans](/billing/) for the allowances).

For new setups, prefer OAuth from the app's connection screen over a pasted key; the API key above is the fallback. The [MCP overview](/mcp/overview/) explains how the stdio server proxies to `app.crontinel.com/api/mcp`.

## Related

- [MCP overview](/mcp/overview/)
- [Agent guide](/agent/guide/) if you want cloud-triggered commands on your own server
- [Security](/security/) for how keys and scopes should be handled
- [Troubleshooting](/troubleshooting/) for connection and 401 errors
