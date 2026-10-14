---
title: MCP Integration Overview
description: Connect Cursor, Claude Code, or Codex over MCP. OAuth first; ordinary evidence reads do not spend hosted AI starts.
---

Crontinel exposes an [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server so AI coding assistants can query your monitoring data inline  –  without opening a browser.

## Example

In Claude Code:

> **You:** Did my `send-invoices` job run last night?
>
> **Claude:** Checking Crontinel... The `send-invoices` command ran at 02:00:14 UTC, completed in 847ms, exit code 0. Last 7 runs all successful.

## How it works

1. The `@crontinel/mcp-server` npm package runs as a local stdio process
2. Your AI assistant spawns it on startup
3. It proxies tool calls to `app.crontinel.com/api/mcp` using your API key
4. Results come back inline in your chat

## Requirements

- Node.js 18+
- A Crontinel account. Prefer OAuth from the app connection screen; a scoped API key is the fallback. MCP is on every tier, including Free. Hosted AI investigation starts are a separate allowance.
- An AI assistant that supports MCP (Cursor, Claude Code, Codex, etc.)

## What you can ask

The assistant mostly reads evidence that your jobs already sent to Crontinel. Typical questions:

- Did a named scheduled job run, and with what exit code and duration?
- Is a queue backing up, or is Horizon paused?
- Which alerts fired recently, and have they resolved?

The tools behind these are listed on [Available Tools](/mcp/tools/). Two tools change state in Crontinel (`acknowledge_alert` and `create_alert`); nothing is written to your own app or servers.

## Set up your client

- [Claude Code setup](/mcp/claude-code/)

## Related

- [Introduction](/introduction/): what Crontinel monitors and why exit `0` is not enough
- [Check-in from any runtime](/check-in/recipes/): how the evidence gets to Crontinel in the first place
- [Billing and plans](/billing/): MCP is on every tier; hosted AI investigation starts have their own allowance
- [Security](/security/): handling API keys and scopes
