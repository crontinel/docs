export function parseFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    return {};
  }

  const data = {};

  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!field) continue;

    let value = field[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    data[field[1]] = value;
  }

  return data;
}

export function linkLine(title, url, description = '') {
  const cleanTitle = String(title).replace(/[\[\]]/g, '').trim();
  const cleanDescription = String(description).replace(/\s+/g, ' ').trim();

  if (!cleanDescription) {
    return `- [${cleanTitle}](${url})`;
  }

  return `- [${cleanTitle}](${url}): ${cleanDescription}`;
}

export function renderLlmsDocument({ title, summary, sections }) {
  const lines = [`# ${title}`, '', `> ${summary}`, ''];

  for (const section of sections) {
    lines.push(`## ${section.heading}`, '');
    for (const item of section.items) {
      lines.push(linkLine(item.title, item.url, item.description));
    }
    lines.push('');
  }

  return `${lines.join('\n').trim()}\n`;
}
