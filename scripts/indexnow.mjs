const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

export function extractLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map((match) => match[1].trim());
}

export function isSitemapIndex(xml) {
  return xml.includes('<sitemapindex');
}

export function buildIndexNowBody({ host, key, urls }) {
  return {
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList: urls.slice(0, 10000),
  };
}

export async function collectUrls(sitemapUrl, fetchImpl = fetch) {
  const response = await fetchImpl(sitemapUrl);

  if (!response.ok) {
    throw new Error(`Sitemap request failed: ${response.status} ${sitemapUrl}`);
  }

  const xml = await response.text();
  const locs = extractLocs(xml);

  if (!isSitemapIndex(xml)) {
    return locs;
  }

  const pages = [];

  for (const loc of locs) {
    const child = await fetchImpl(loc);

    if (!child.ok) {
      throw new Error(`Sitemap request failed: ${child.status} ${loc}`);
    }

    pages.push(...extractLocs(await child.text()));
  }

  return pages;
}

export async function pingIndexNow({ host, key, urls, fetchImpl = fetch, wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms)) }) {
  const body = buildIndexNowBody({ host, key, urls });
  let lastStatus = 0;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetchImpl(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    });
    lastStatus = response.status;

    if (response.status === 200 || response.status === 202) {
      return { status: response.status, count: body.urlList.length };
    }

    if (attempt < 2) {
      await wait(2000);
    }
  }

  throw new Error(`IndexNow rejected ${host} with HTTP ${lastStatus}`);
}
