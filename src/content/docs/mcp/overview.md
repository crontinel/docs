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
