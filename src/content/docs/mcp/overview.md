---
title: MCP Integration Overview
description: Using Crontinel with AI assistants via Model Context Protocol
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
- A Crontinel account with an API key
- An AI assistant that supports MCP (Claude Code, Cursor, etc.)
