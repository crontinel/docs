import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { handleCrawl } from '../scripts/crawl-guard.mjs';

const robots = readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8');
const llms = readFileSync(new URL('../public/llms.txt', import.meta.url), 'utf8');

test('docs robots allows named AI crawlers and points at llms.txt', () => {
  for (const bot of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Bingbot', 'Google-Extended']) {
    assert.match(robots, new RegExp(`User-agent: ${bot}\\nContent-Signal: search=yes, ai-train=yes, ai-input=yes\\nAllow: /`));
  }
  assert.match(robots, /Sitemap: https:\/\/docs\.crontinel\.com\/sitemap-index\.xml/);
  assert.match(robots, /LLMs\.txt: https:\/\/docs\.crontinel\.com\/llms\.txt/);
});

test('docs llms.txt points at the introduction and the product site', () => {
  assert.match(llms, /https:\/\/docs\.crontinel\.com\/introduction\//);
  assert.match(llms, /https:\/\/crontinel\.com\/llms\.txt/);
  assert.match(llms, /https:\/\/docs\.crontinel\.com\/sdks\/laravel\//);
});

function memoryCache() {
  const store = new Map();
  return {
    async match(request) {
      return store.get(request.url);
    },
    async put(request, response) {
      store.set(request.url, response);
    },
  };
}

test('unknown automated clients are capped at 20 requests', async () => {
  const cache = memoryCache();
  const fetchAsset = async () => new Response('ok', { status: 200 });
  let last;
  for (let i = 0; i < 21; i += 1) {
    const request = new Request('https://docs.crontinel.com/introduction/', {
      headers: { 'user-agent': 'python-requests/2.32.0', 'cf-connecting-ip': '198.51.100.4' },
    });
    last = await handleCrawl(request, {}, fetchAsset, cache);
  }
  assert.equal(last.status, 429);
});

test('named AI crawlers can learn and are capped at 60 requests', async () => {
  const cache = memoryCache();
  const fetchAsset = async () => new Response('page', { status: 200 });
  let last;
  for (let i = 0; i < 60; i += 1) {
    const request = new Request('https://docs.crontinel.com/quick-start/', {
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
        'cf-connecting-ip': '198.51.100.5',
      },
    });
    last = await handleCrawl(request, {}, fetchAsset, cache);
    assert.equal(last.status, 200);
  }
  const blocked = await handleCrawl(new Request('https://docs.crontinel.com/quick-start/', {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
      'cf-connecting-ip': '198.51.100.5',
    },
  }), {}, fetchAsset, cache);
  assert.equal(blocked.status, 429);
});

test('browsers are not capped', async () => {
  const cache = memoryCache();
  let fetches = 0;
  const fetchAsset = async () => {
    fetches += 1;
    return new Response('html', { status: 200 });
  };
  for (let i = 0; i < 25; i += 1) {
    const response = await handleCrawl(new Request('https://docs.crontinel.com/', {
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
        'cf-connecting-ip': '198.51.100.6',
      },
    }), {}, fetchAsset, cache);
    assert.equal(response.status, 200);
  }
  assert.equal(fetches, 25);
});
