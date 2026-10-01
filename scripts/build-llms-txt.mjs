import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parseFrontmatter, renderLlmsDocument } from './llms-document.mjs';

const site = 'https://docs.crontinel.com';
const contentRoot = new URL('../src/content/docs/', import.meta.url);

const headings = {
  root: 'Guides',
  sdks: 'SDKs',
  monitors: 'Monitors',
  alerts: 'Alerts',
  mcp: 'AI clients',
  agent: 'Agent',
  reference: 'Reference',
};

function walk(dir) {
  const files = [];

  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      files.push(...walk(path));
    } else if (/\.(md|mdx)$/.test(entry)) {
      files.push(path);
    }
  }

  return files;
}

export function docsPageUrl(file) {
  const slug = relative(contentRoot.pathname, file)
    .replace(/\.(md|mdx)$/, '')
    .replace(/\/index$/, '')
    .replaceAll('\\', '/');

  return slug ? `${site}/${slug}/` : `${site}/`;
}

export function docsItems() {
  return walk(contentRoot.pathname).map((file) => {
    const source = readFileSync(file, 'utf8');
    const data = parseFrontmatter(source);
    const planned = /not yet available/i.test(source);

    return {
      title: data.title || relative(contentRoot.pathname, file),
      url: docsPageUrl(file),
      description: planned
        ? 'Planned feature. Not available in a released package yet.'
        : (data.description || ''),
      group: relative(contentRoot.pathname, file).includes('/')
        ? relative(contentRoot.pathname, file).split('/')[0]
        : 'root',
    };
  }).sort((a, b) => a.url.localeCompare(b.url));
}

export function docsLlms() {
  const items = docsItems();
  const groups = [...new Set(items.map((item) => item.group))];
  const order = ['root', 'sdks', 'monitors', 'alerts', 'mcp', 'agent', 'reference'];
  groups.sort((a, b) => order.indexOf(a) - order.indexOf(b));

  const sections = [
    {
      heading: 'Start',
      items: [
        {
          title: 'Docs home',
          url: `${site}/`,
          description: 'Documentation for installing and operating Crontinel',
        },
      ],
    },
    ...groups.map((group) => ({
      heading: headings[group] || group,
      items: items.filter((item) => item.group === group),
    })),
    {
      heading: 'Product',
      items: [
        {
          title: 'Marketing site guide for assistants',
          url: 'https://crontinel.com/llms.txt',
          description: 'Public pages on crontinel.com',
        },
        {
          title: 'Hosted app',
          url: 'https://app.crontinel.com/',
          description: 'Sign in to the hosted monitor. Customer data is not part of this guide.',
        },
      ],
    },
  ];

  return renderLlmsDocument({
    title: 'Crontinel docs',
    summary: 'Documentation for Crontinel, monitoring for cron jobs, queues, workers, and background tasks.',
    sections,
  });
}

if (process.argv[1] && process.argv[1].endsWith('build-llms-txt.mjs')) {
  writeFileSync(new URL('../public/llms.txt', import.meta.url), docsLlms());
}
