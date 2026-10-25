// Parses the Jekyll / Hugo style frontmatter used by posts.
// Supports the flat subset posts need: strings, numbers, booleans, dates and [a, b] lists.

function scalar(raw) {
  const v = raw.trim();
  if (v === '') return '';
  if (/^(true|false)$/i.test(v)) return v.toLowerCase() === 'true';
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  if (/^\[.*\]$/.test(v)) {
    const inner = v.slice(1, -1).trim();
    return inner ? inner.split(',').map((x) => scalar(x)) : [];
  }
  const quoted = v.match(/^(["'])(.*)\1$/);
  return quoted ? quoted[2] : v;
}

export function parseFrontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: src };

  const data = {};
  let listKey = null;
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const listItem = line.match(/^\s+-\s+(.*)$/);
    if (listItem && listKey) {
      data[listKey].push(scalar(listItem[1]));
      continue;
    }
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (!kv) continue;
    if (kv[2].trim() === '') {
      listKey = kv[1];
      data[listKey] = [];
    } else {
      listKey = null;
      data[kv[1]] = scalar(kv[2]);
    }
  }
  return { data, body: src.slice(m[0].length) };
}
