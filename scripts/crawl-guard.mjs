import bots from './crawl-bots.json' with { type: 'json' };

const AI_BOTS = bots.ai;
const SEARCH_BOTS = bots.search;
const LIMITS = { ai: 60, search: 120, unknown: 20 };

function includesToken(userAgent, token) {
  return userAgent.toLowerCase().includes(token.toLowerCase());
}

export function classifyUserAgent(userAgent) {
  const ua = userAgent || '';

  if (AI_BOTS.some((token) => includesToken(ua, token))) {
    return 'ai';
  }

  if (SEARCH_BOTS.some((token) => includesToken(ua, token))) {
    return 'search';
  }

  if (looksLikeBrowser(ua)) {
    return 'browser';
  }

  return 'unknown';
}

function looksLikeBrowser(userAgent) {
  if (!/Mozilla\/5\.0/.test(userAgent)) {
    return false;
  }

  if (/bot|crawler|spider|slurp|curl|wget|python|scrapy|headless/i.test(userAgent)) {
    return false;
  }

  return /(Chrome|Firefox|Safari|Edg|OPR)\//.test(userAgent);
}

const DOC_REDIRECTS = {
  '/': '/introduction/',
  '/quickstart': '/quick-start/',
  '/quickstart/': '/quick-start/',
  '/pricing': 'https://crontinel.com/pricing/',
  '/pricing/': 'https://crontinel.com/pricing/',
  '/marketing/seo-writing': '/introduction/',
  '/marketing/seo-writing/': '/introduction/',
  '/sitemap.xml': '/sitemap-index.xml',
};

export function docsRedirect(url) {
  const target = DOC_REDIRECTS[url.pathname];

  if (!target) {
    return null;
  }

  const location = target.startsWith('http') ? target : new URL(target, url.origin).toString();
  return { status: 301, location };
}

export async function handleCrawl(request, env, fetchAsset, cacheStore) {
  const redirect = docsRedirect(new URL(request.url));

  if (redirect) {
    return Response.redirect(redirect.location, redirect.status);
  }

  const kind = classifyUserAgent(request.headers.get('user-agent'));
  const limit = LIMITS[kind];
  const cache = cacheStore || globalThis.caches?.default;

  if (limit && cache) {
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const cacheKey = new Request(`https://docs.crontinel.com/__crawl-count/${kind}/${encodeURIComponent(ip)}`);
    const existing = await cache.match(cacheKey);
    const count = existing ? Number(await existing.clone().text()) : 0;

    if (count >= limit) {
      return new Response('Too Many Requests', {
        status: 429,
        headers: {
          'content-type': 'text/plain; charset=utf-8',
          'retry-after': '60',
          'cache-control': 'no-store',
        },
      });
    }

    await cache.put(cacheKey, new Response(String(count + 1), {
      headers: { 'cache-control': 'max-age=60' },
    }));
  }

  return fetchAsset(request);
}

export default {
  async fetch(request, env) {
    return handleCrawl(request, env, (assetRequest) => env.ASSETS.fetch(assetRequest));
  },
};
