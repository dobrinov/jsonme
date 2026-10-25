// A small GitHub-flavoured Markdown subset: headings, paragraphs, lists,
// fenced code, blockquotes, rules, tables, links, images and emphasis.
// Raw HTML is escaped, never passed through.

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function safeUrl(url) {
  const u = url.trim();
  return /^(javascript|vbscript|data):/i.test(u) ? '#' : u;
}

export function inline(text) {
  const slots = [];
  const keep = (html) => `\u0000${slots.push(html) - 1}\u0000`;

  let s = text.replace(/`([^`]+)`/g, (_, code) => keep(`<code>${escapeHtml(code)}</code>`));
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_, alt, src, title) =>
    keep(`<img src="${escapeHtml(safeUrl(src))}" alt="${escapeHtml(alt)}"${title ? ` title="${escapeHtml(title)}"` : ''} loading="lazy">`));
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) =>
    keep(`<a href="${escapeHtml(safeUrl(href))}">${inline(label)}</a>`));
  s = s.replace(/<(https?:\/\/[^>\s]+)>/g, (_, href) => keep(`<a href="${escapeHtml(href)}">${escapeHtml(href)}</a>`));

  s = escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*(?!\s)(.+?)\*(?!\w)/g, '$1<em>$2</em>')
    .replace(/(^|[^_\w])_(?!\s)(.+?)_(?!\w)/g, '$1<em>$2</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>');

  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => slots[Number(i)]);
}

const LIST_ITEM = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;

// Headings are shifted down by `shift` levels, so a post's "# Title" sits under the page's own h1.
export function markdown(src, { shift = 0 } = {}) {
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let i = 0;

  const isBlockStart = (l) =>
    /^\s*(#{1,6}\s|```|~~~|>|(\*\s*){3,}$|(-\s*){3,}$|(_\s*){3,}$)/.test(l) || LIST_ITEM.test(l);

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    const fence = line.match(/^\s*(```|~~~)\s*([\w+-]*)/);
    if (fence) {
      const body = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(fence[1])) body.push(lines[i++]);
      i++;
      const lang = fence[2] ? ` class="language-${escapeHtml(fence[2])}"` : '';
      out.push(`<pre><code${lang}>${escapeHtml(body.join('\n'))}</code></pre>`);
      continue;
    }

    const heading = line.match(/^\s*(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (heading) {
      const level = Math.min(6, heading[1].length + shift);
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      i++;
      continue;
    }

    if (/^\s*((\*\s*){3,}|(-\s*){3,}|(_\s*){3,})$/.test(line)) {
      out.push('<hr>');
      i++;
      continue;
    }

    if (/^\s*>/.test(line)) {
      const body = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) body.push(lines[i++].replace(/^\s*>\s?/, ''));
      out.push(`<blockquote>${markdown(body.join('\n'), { shift })}</blockquote>`);
      continue;
    }

    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/.test(lines[i + 1])) {
      const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const head = cells(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) rows.push(cells(lines[i++]));
      out.push('<table><thead><tr>' + head.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>' +
        rows.map((r) => '<tr>' + r.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') + '</tbody></table>');
      continue;
    }

    const item = line.match(LIST_ITEM);
    if (item) {
      const ordered = /\d/.test(item[2]);
      const start = ordered ? parseInt(item[2], 10) : 1;
      const indent = item[1].length;
      const items = [];
      while (i < lines.length) {
        const m = lines[i].match(LIST_ITEM);
        if (m && m[1].length === indent && /\d/.test(m[2]) === ordered) {
          items.push([m[3]]);
          i++;
        } else if (lines[i].trim() && items.length && /^\s+/.test(lines[i]) && !/^\s*(```|~~~)/.test(lines[i])) {
          items[items.length - 1].push(lines[i].slice(Math.min(indent + 2, lines[i].search(/\S/))));
          i++;
        } else if (!lines[i].trim() && i + 1 < lines.length && (lines[i + 1].match(LIST_ITEM) || [])[1]?.length === indent) {
          i++;
        } else {
          break;
        }
      }
      const tag = ordered ? 'ol' : 'ul';
      const startAttr = ordered && start !== 1 ? ` start="${start}"` : '';
      out.push(`<${tag}${startAttr}>` + items.map((body) => {
        const html = body.length > 1 ? markdown(body.join('\n'), { shift }) : inline(body[0]);
        return `<li>${html.replace(/^<p>([\s\S]*?)<\/p>/, '$1')}</li>`;
      }).join('') + `</${tag}>`);
      continue;
    }

    const para = [];
    while (i < lines.length && lines[i].trim() && !(para.length && isBlockStart(lines[i]))) para.push(lines[i++].trim());
    out.push(`<p>${inline(para.join('\n')).replace(/\n/g, ' ')}</p>`);
  }

  return out.join('\n');
}

export function plainText(src) {
  return src
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
