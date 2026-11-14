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

Point your assistant at the hosted MCP server:

```
https://app.crontinel.com/mcp
```

It signs in with OAuth 2.1 (PKCE and dynamic client registration), so most clients only need the URL. By default the connection gets the read scopes `monitor:read`, `run:read`, and `incident:read`. `investigation:run` and `monitor:write` are opt-in: the client must request them and the consent screen shows them. If your client cannot do OAuth, create a scoped key at [/settings/ai-connections](https://app.crontinel.com/settings/ai-connections) and send it as a bearer token.

**Legacy:** the `@crontinel/mcp-server` npm package runs as a local stdio process and proxies to `app.crontinel.com/api/mcp` with an app API key. It has a different, older tool set. The app API key is the key your jobs use to send data; it is not a scoped MCP key.

## Requirements

- A Crontinel account. MCP is on every tier, including Free. Hosted AI investigation starts are a separate allowance.
- An AI assistant that supports remote MCP servers (Cursor, Claude Code, Codex, etc.)
- Node.js 18+ only for the legacy stdio package

## What you can ask

The assistant mostly reads evidence that your jobs already sent to Crontinel. Typical questions:

- Did a named scheduled job run, and with what exit code and duration?
- Is a queue backing up, or is Horizon paused?
- Which alerts fired recently, and have they resolved?

The tools behind these are listed on [Available Tools](/mcp/tools/). On the hosted server, the three `save_*` tools change configuration and need `monitor:write`; `start_investigation` and `cancel_investigation` need `investigation:run`. On the legacy server, `acknowledge_alert` and `create_alert` change state. Nothing is written to your own app or servers.

## Set up your client

- [Claude Code setup](/mcp/claude-code/)

## Related

- [Introduction](/introduction/): what Crontinel monitors and why exit `0` is not enough
- [Check-in from any runtime](/check-in/recipes/): how the evidence gets to Crontinel in the first place
- [Billing and plans](/billing/): MCP is on every tier; hosted AI investigation starts have their own allowance
- [Security](/security/): handling API keys and scopes
