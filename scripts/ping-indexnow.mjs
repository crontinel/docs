import { readFileSync } from 'node:fs';
import { collectUrls, pingIndexNow } from './indexnow.mjs';

const INDEXNOW_KEY = 'b7e2c4a91f6d4c0e8a3b5d7f9c1e2a40';

function argument(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? '' : process.argv[index + 1] || '';
}

const host = argument('--host') || 'crontinel.com';
const keyFile = argument('--key-file') || `public/${INDEXNOW_KEY}.txt`;
const sitemap = argument('--sitemap') || `https://${host}/sitemap.xml`;
const key = readFileSync(keyFile, 'utf8').trim();

if (key !== INDEXNOW_KEY) {
  console.error(`IndexNow key file does not match the published key.`);
  process.exit(1);
}

const urls = await collectUrls(sitemap);
const result = await pingIndexNow({ host, key, urls });
console.log(`IndexNow accepted ${result.count} URLs for ${host} (HTTP ${result.status}).`);
