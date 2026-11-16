---
title: Node.js / TypeScript
description: Send the outcome receipt from Node with fetch. The @crontinel/node package on npm is not a working install path.
---

Use the [HTTP check-in recipe](/check-in/recipes/) for Node. It is one `fetch` call at the end of your job with the app ingest key, and it needs no package.

## Why not `@crontinel/node`

The npm package is not a supported path:

- npm has only version 0.1.0, from April. Its ESM import fails with `Crontinel is not a constructor`, and `require` fails because the CommonJS build it points at is not shipped.
- The newer code in [crontinel/node](https://github.com/crontinel/node) is not published to npm, and it talks to the MCP endpoint rather than the run receipt (`POST /api/v1/ingest/cron`).
- It has no `crontinel agent` command. The remote command agent is in the [Laravel package](/agent/guide/).

This page will cover the package again once it is published, sends the run receipt and has a maintainer.
