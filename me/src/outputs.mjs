// Machine-readable outputs: /cv.md and /llms.txt for AI agents, /feed.xml for readers.
import { escapeHtml as e } from './markdown.mjs';
import { employers } from './render.mjs';

const year = (d) => (d ? String(d).slice(0, 4) : 'now');
const span = (from, to) => `${year(from)} – ${year(to)}`;
const link = (base, path) => (base ? base + path : path);

export function cvMarkdown(me, posts, { siteUrl = '' } = {}) {
  const b = me.basics;
  const out = [`# ${b.name}`, ''];
  const where = [b.label, b.location && b.location.city, b.location && (b.location.country || b.location.countryCode)].filter(Boolean).join(' · ');
  if (where) out.push(where, '');
  const reach = [b.email, b.url, ...(b.profiles || []).filter((p) => p.url).map((p) => `${p.network ? `${p.network}: ` : ''}${p.url}`)].filter(Boolean);
  if (reach.length) out.push(`Contact: ${reach.join(' · ')}`, '');
  if (me.headline) out.push(`> ${me.headline}`, '');
  if (b.summary) out.push(b.summary, '');
  if (me.meta && me.meta.me && me.meta.me.lookingFor) out.push(`**Looking for:** ${me.meta.me.lookingFor}`, '');

  if (me.facts && me.facts.length) {
    out.push('## At a glance', '', ...me.facts.map((f) => `- **${f.value}** ${f.label}`), '');
  }

  const side = (title, list) => {
    if (!list || !list.length) return;
    out.push(`### ${title}`, '');
    for (const x of list) {
      out.push(`- **${x.name}.** ${[x.proof, x.detail].filter(Boolean).join('. ')}`);
      const p = x.aiPractice;
      if (p) {
        if (p.delegated) out.push(`  - Delegated to AI: ${p.delegated}`);
        if (p.owned) out.push(`  - Owned: ${p.owned}`);
        if (p.verifiedBy && p.verifiedBy.length) out.push(`  - Verified by: ${p.verifiedBy.join(', ')}`);
      }
    }
    out.push('');
  };
  if (me.expertise) {
    out.push('## Expertise', '');
    side('Engineering', me.expertise.engineering);
    side('AI-native', me.expertise.ai);
  }

  if (me.highlights && me.highlights.length) {
    out.push('## Signature work', '');
    for (const s of me.highlights) {
      out.push(`### ${s.title}`, '');
      if (s.where || s.when) out.push(`_${[s.where, s.when].filter(Boolean).join(' · ')}_`, '');
      out.push(`- **Problem:** ${s.problem}`, `- **What I did:** ${s.did}`, `- **Outcome:** ${s.outcome}`);
      if (s.stack && s.stack.length) out.push(`- **Stack:** ${s.stack.join(', ')}`);
      for (const ev of s.evidence || []) out.push(`- **Evidence:** ${typeof ev === 'string' ? ev : ev.url}`);
      out.push('');
    }
  }

  const groups = employers(me.work);
  if (groups.length) {
    out.push('## Career', '');
    for (const g of groups) {
      out.push(`### ${g.name} (${span(g.start, g.end)})`, '');
      for (const r of g.roles) {
        out.push(`**${r.position || 'Role'}**${r.scope ? ` (${r.scope})` : ''}${r.summary ? `. ${r.summary}` : ''}`, '');
        if (r.highlights && r.highlights.length) out.push(...r.highlights.map((h) => `- ${h}`), '');
      }
    }
  }

  if (me.projects && me.projects.length) {
    out.push('## Own products', '');
    for (const p of me.projects) out.push(`- **${p.name}** (${span(p.startDate, p.endDate)}${p.revivedDate ? `, built by hand, revived with AI in ${p.revivedDate.slice(0, 4)}` : p.vibecoded ? ', vibe-coded' : ''})${p.url ? ` ${p.url}` : ''}${p.description ? `. ${p.description}` : ''}${p.revival ? ` ${p.revival}` : ''}`);
    out.push('');
  }

  if (me.skills && me.skills.length) {
    out.push('## Skills', '', ...me.skills.map((s) => `- **${s.name}:** ${(s.keywords || []).join(', ') || s.level || ''}`), '');
  }

  if (me.education && me.education.length) {
    out.push('## Education', '', ...me.education.map((x) => `- ${[x.studyType, x.area].filter(Boolean).join(', ')}, ${x.institution} (${span(x.startDate, x.endDate)})`), '');
  }

  if (posts.length) {
    out.push('## Writing', '', ...posts.map((p) => `- [${p.title}](${link(siteUrl, `posts/${p.slug}/`)})${p.date ? ` (${p.date})` : ''}`), '');
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

export function llmsTxt(me, posts, { siteUrl = '' } = {}) {
  const b = me.basics;
  const out = [`# ${b.name}`, '', `> ${me.headline || b.label || 'Software developer'}`, ''];
  const intro = [b.label, b.location && b.location.city].filter(Boolean).join(', ');
  out.push(`This is the personal site and CV of ${b.name}${intro ? ` (${intro})` : ''}, published with {me} from a git repo. The files below are written by ${b.name} and are the source of truth.`, '');
  out.push('## CV', '');
  out.push(`- [Full CV in Markdown](${link(siteUrl, 'cv.md')}): expertise, signature work, career, products, skills`);
  out.push(`- [me.json](${link(siteUrl, 'me.json')}): the same data as JSON Resume plus {me} fields`);
  out.push('');
  if (posts.length) {
    out.push('## Writing', '', ...posts.map((p) => `- [${p.title}](${link(siteUrl, `posts/${p.slug}/`)})${p.summary ? `: ${p.summary}` : ''}`), '');
  }
  return out.join('\n').trimEnd() + '\n';
}

export function feedXml(me, posts, { siteUrl = '' } = {}) {
  const items = posts.slice(0, 20).map((p) => {
    const url = link(siteUrl, `posts/${p.slug}/`);
    const date = p.date ? new Date(`${p.date}T00:00:00Z`).toUTCString() : '';
    return `<item><title>${e(p.title)}</title><link>${e(url)}</link><guid>${e(url)}</guid>${date ? `<pubDate>${date}</pubDate>` : ''}${p.summary ? `<description>${e(p.summary)}</description>` : ''}</item>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>${e(me.basics.name)}</title><link>${e(siteUrl || './')}</link><description>${e(me.headline || `Writing by ${me.basics.name}`)}</description>
${items}
</channel></rss>
`;
}
