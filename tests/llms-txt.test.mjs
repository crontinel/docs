import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { docsItems, docsLlms, docsLlmsFull } from '../scripts/build-llms-txt.mjs';

const generated = docsLlms();
const published = readFileSync(new URL('../public/llms.txt', import.meta.url), 'utf8');

test('llms.txt lists every docs page, including billing and agent monitoring', () => {
  for (const item of docsItems()) {
    assert.match(generated, new RegExp(item.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(generated, /https:\/\/docs\.crontinel\.com\/billing\//);
  assert.match(generated, /https:\/\/docs\.crontinel\.com\/mcp\/ai-agent-monitoring\//);
});

test('the published llms.txt matches the generator', () => {
  assert.equal(published, generated);
});

test('llms-full.txt matches the generator and skips planned pages', () => {
  const full = readFileSync(new URL('../public/llms-full.txt', import.meta.url), 'utf8');
  assert.equal(full, docsLlmsFull());
  assert.match(full, /URL: https:\/\/docs\.crontinel\.com\/check-in\/recipes\//);
  assert.doesNotMatch(full, /agentRunStart/);
});
