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
    // Only the explicit "coming soon" banner (or planned: true) marks a page unpublished.
    // Body copy like "PagerDuty is on the roadmap" must not blank the whole page description.
    const planned = data.planned === true || data.planned === 'true'
      || /^>\s*.*coming soon.*not yet available/im.test(source);

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
          title: 'Full docs text',
          url: `${site}/llms-full.txt`,
          description: 'Every published docs page in one plain-text file',
        },
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

// One plain-text file with every published docs page, for assistants that read a single URL.
export function docsLlmsFull() {
  const parts = [
    '# Crontinel docs: full text',
    '',
    `Source: ${site}/. Short index: ${site}/llms.txt. Marketing site: https://crontinel.com/llms-full.txt`,
    '',
  ];

  for (const file of walk(contentRoot.pathname).sort()) {
    const source = readFileSync(file, 'utf8');
    const data = parseFrontmatter(source);
    if (data.planned === true || data.planned === 'true' || /^>\s*.*coming soon.*not yet available/im.test(source)) continue;

    const body = source
      .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
      .replace(/^import .*$/gm, '')
      .replace(/<\/?(Card|CardGrid)[^>]*>/g, '')
      .trim();

    parts.push('---', '', `# ${data.title}`, `URL: ${docsPageUrl(file)}`, '', body, '');
  }

  return `${parts.join('\n').trim()}\n`;
}

if (process.argv[1] && process.argv[1].endsWith('build-llms-txt.mjs')) {
  writeFileSync(new URL('../public/llms.txt', import.meta.url), docsLlms());
  writeFileSync(new URL('../public/llms-full.txt', import.meta.url), docsLlmsFull());
}
