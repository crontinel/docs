---
title: Node.js / TypeScript
description: Install and configure @crontinel/node for Node.js applications
---

import { Aside } from '@astrojs/starlight/components';

## Quickstart

Get from zero to your first data in under 3 minutes.

### 1. Prerequisites

- Node.js 18+
- A Crontinel account ([sign up free](https://app.crontinel.com/register))
- An app created in the dashboard
- Your API key (`crn_live_...`) from app settings

### 2. Install

```bash
npm install @crontinel/node
```

Or with your preferred package manager:

```bash
# yarn
yarn add @crontinel/node

# pnpm
pnpm add @crontinel/node
```

### 3. Configure

Create a `quickstart.mjs` file:

```javascript
import Crontinel from '@crontinel/node';

const crontinel = new Crontinel({
  apiKey: process.env.CRONTINEL_API_KEY,
  appName: 'my-first-app',
});

// Report a cron job run
await crontinel.scheduleRun({
  command: 'hello-from-node',
  duration_ms: 100,
  exit_code: 0,
});

console.log('Data sent to Crontinel!');
```

Set your API key and run it:

```bash
export CRONTINEL_API_KEY=crn_live_xxxxxxxxxxxx
node quickstart.mjs
```

### 4. Dashboard verification

1. Go to [app.crontinel.com](https://app.crontinel.com) → **Apps** → your app
2. Check the **Cron** section — you should see the `hello-from-node` job with exit code `0` and `100ms` duration
3. Your first data is on the dashboard!

<Aside>
If the cron section shows "no data yet", give it a few seconds and refresh. The API ingests data in near-real-time.
</Aside>

---

## Requirements

- Node.js 18+

## Install

```bash
npm install @crontinel/node
# or
yarn add @crontinel/node
# or
pnpm add @crontinel/node
```

## Quick Start

```typescript
import Crontinel from '@crontinel/node';

const crontinel = new Crontinel({
  apiKey: process.env.CRONTINEL_API_KEY!,
  appName: 'my-service',
});

// Report a cron job run
await crontinel.scheduleRun({
  command: 'reports:generate',
  duration_ms: 2340,
  exit_code: 0, // 0 = success, 1 = failure
});

// Report queue worker activity
await crontinel.queueProcessed({
  queue: 'emails',
  processed: 12,
  failed: 0,
  duration_ms: 8901,
});
```

## `monitorSchedule` helper

Wrap any async function and automatically report its outcome:

```typescript
const result = await crontinel.monitorSchedule('reports:generate', async () => {
  const sent = await sendDailyReports();
  return { sent, failed: 0 };
});
// { result: { sent: 142, failed: 0 }, duration_ms: 1840, exit_code: 0 }
```

## BullMQ integration

```typescript
import { Worker } from 'bullmq';
import Crontinel from '@crontinel/node';

const crontinel = new Crontinel({ apiKey: process.env.CRONTINEL_API_KEY! });

const worker = new Worker('emails', async (job) => {
  const start = Date.now();
  try {
    const result = await processJob(job);
    await crontinel.queueProcessed({ queue: 'emails', processed: 1, failed: 0, duration_ms: Date.now() - start });
    return result;
  } catch (err) {
    await crontinel.queueProcessed({ queue: 'emails', processed: 0, failed: 1, duration_ms: Date.now() - start });
    throw err;
  }
}, { connection: redisConnection });
```

## node-cron integration

```typescript
import cron from 'node-cron';
import Crontinel from '@crontinel/node';

const crontinel = new Crontinel({ apiKey: process.env.CRONTINEL_API_KEY! });

cron.schedule('0 9 * * *', async () => {
  const result = await crontinel.monitorSchedule('send-daily-reports', dailyReportTask);
  console.log('Report sent:', result.exit_code === 0 ? 'OK' : 'FAILED');
});
```

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `CRONTINEL_API_KEY` | — | Your Crontinel API key (required) |
| `CRONTINEL_API_URL` | `https://app.crontinel.com` | SaaS or self-hosted endpoint |
