import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { docsRedirect } from '../scripts/crawl-guard.mjs';

const redirectsFile = readFileSync(new URL('../public/_redirects', import.meta.url), 'utf8');

function publishedRedirects(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const [path, location, status] = line.split(/\s+/);
      return { path, location, status: Number(status) };
    });
}

test('the docs root is a redirect rule, not a noindex page', () => {
  assert.equal(existsSync(new URL('../src/pages/index.astro', import.meta.url)), false);
  const decision = docsRedirect(new URL('https://docs.crontinel.com/'));
  assert.equal(decision.status, 301);
  assert.equal(decision.location, 'https://docs.crontinel.com/introduction/');
});

test('retired docs URLs match public/_redirects', () => {
  const expected = [
    ['/', '/introduction/'],
    ['/quickstart', '/quick-start/'],
    ['/quickstart/', '/quick-start/'],
    ['/pricing', 'https://crontinel.com/pricing/'],
    ['/pricing/', 'https://crontinel.com/pricing/'],
    ['/marketing/seo-writing', '/introduction/'],
    ['/marketing/seo-writing/', '/introduction/'],
    ['/sitemap.xml', '/sitemap-index.xml'],
  ];
  const fromFile = publishedRedirects(redirectsFile);

  assert.deepEqual(
    fromFile.map((rule) => [rule.path, rule.location]),
    expected,
  );
  assert.equal(fromFile.every((rule) => rule.status === 301), true);

  for (const [path, location] of expected) {
    const decision = docsRedirect(new URL(`https://docs.crontinel.com${path}`));
    const absolute = location.startsWith('http')
      ? location
      : new URL(location, 'https://docs.crontinel.com').toString();
    assert.equal(decision.location, absolute, path);
  }
});
