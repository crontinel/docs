import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const source = readFileSync(new URL('./crawl-guard.mjs', import.meta.url), 'utf8');
const bots = readFileSync(new URL('./crawl-bots.json', import.meta.url), 'utf8').trim();
const bundled = source.replace(
  "import bots from './crawl-bots.json' with { type: 'json' };",
  `const bots = ${bots};`,
);

mkdirSync(new URL('../dist/', import.meta.url), { recursive: true });
writeFileSync(new URL('../dist/_worker.js', import.meta.url), bundled);
