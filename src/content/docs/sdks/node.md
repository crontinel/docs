---
title: Node.js / TypeScript
description: Install and configure @crontinel/node for Node.js applications
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
