import { escapeHtml as e, markdown, inline } from './markdown.mjs';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TAG_LABEL = { depth: 'Depth', leadership: 'Leadership', product: 'Product', ai: 'AI era' };
const FONTS = 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap';

// '2016-05' -> 2016.33; missing -> now
export const toYear = (d, now) => {
  if (!d) return now;
  const [y, m = '01'] = String(d).split('-');
  return Number(y) + (Number(m) - 1) / 12;
};
const nowYear = (date) => date.getUTCFullYear() + date.getUTCMonth() / 12;
const year = (d) => (d ? String(d).slice(0, 4) : 'now');
const span = (from, to) => (year(from) === year(to) ? year(from) : `${year(from)} – ${year(to)}`);
export const slug = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
export const longDate = (iso) => {
  const [y, m, d] = String(iso).split('-').map(Number);
  return d ? `${d} ${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m - 1]} ${y}` : String(iso);
};
const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
const href = (url) => (/^[a-z][\w+.-]*:/i.test(url) ? url : `https://${url}`);
const hostOf = (url) => String(url).replace(/^https?:\/\//, '').replace(/\/$/, '');
const evidence = (x) => (typeof x === 'string' ? { url: x, label: hostOf(x) } : { url: x.url, label: x.label || hostOf(x.url) });

function avatar(basics, root) {
  if (!basics.image) return `<span class="avatar" aria-hidden="true">${e(initials(basics.name))}</span>`;
  const src = /^[a-z]+:|^\//i.test(basics.image) ? basics.image : root + basics.image;
  return `<img class="avatar" src="${e(src)}" alt="" width="56" height="56">`;
}

function page({ title, description, root, body, canonical }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(title)}</title>
${description ? `<meta name="description" content="${e(description)}">\n` : ''}${canonical ? `<link rel="canonical" href="${e(canonical)}">\n` : ''}<link rel="alternate" type="application/json" href="${root}me.json">
<link rel="alternate" type="application/rss+xml" href="${root}feed.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="${root}assets/me.css">
</head>
<body>
${body}
<script src="${root}assets/me.js" defer></script>
</body>
</html>
`;
}

export function careerStats(me, now) {
  const starts = (me.work || []).map((w) => toYear(w.startDate, now));
  const first = starts.length ? Math.min(...starts) : null;
  const aiEra = toYear((me.meta && me.meta.me && me.meta.me.aiEraStart) || '2023-01', now);
  return {
    first,
    aiEra,
    years: first == null ? 0 : Math.floor(now - first),
    preAiYears: first == null ? 0 : Math.max(0, Math.floor(aiEra - first))
  };
}

function facts(me, stats) {
  let list = me.facts;
  if (!list || !list.length) {
    list = [];
    if (stats.years) list.push({ value: `${stats.years} yrs`, label: `shipping software${stats.preAiYears ? `, ${stats.preAiYears} of them before AI coding tools` : ''}.` });
    const employers = new Set((me.work || []).map((w) => w.name)).size;
    if (employers) list.push({ value: String(employers), label: employers === 1 ? 'employer.' : 'employers.' });
    if ((me.projects || []).length) list.push({ value: String(me.projects.length), label: 'products built on the side.' });
  }
  if (!list.length) return '';
  return `<div class="facts">${list.map((f) => `<div class="fact"><span class="value${f.value.length > 14 ? ' long' : ''}">${e(f.value)}</span><span class="label">${e(f.label)}</span></div>`).join('')}</div>`;
}

function expertiseItem(x) {
  const p = x.aiPractice || {};
  const practice = [
    p.delegated && ['Delegated', p.delegated],
    p.owned && ['Owned', p.owned],
    p.verifiedBy && p.verifiedBy.length && ['Verified by', p.verifiedBy.join(', ')]
  ].filter(Boolean);
  const head = `<span class="text"><span class="name">${e(x.name)}</span><span class="proof">${inline(x.proof || '')}</span></span>`;
  if (!x.detail && !practice.length) return `<div class="skill"><div class="static">${head}</div></div>`;
  return `<details class="skill"><summary>${head}<span class="sign" aria-hidden="true"></span></summary><div class="detail">${x.detail ? `<p>${inline(x.detail)}</p>` : ''}${practice.length ? `<dl class="practice">${practice.map(([k, v]) => `<dt>${k}</dt><dd>${e(v)}</dd>`).join('')}</dl>` : ''}</div></details>`;
}

function expertise(me, stats) {
  const eng = (me.expertise && me.expertise.engineering) || [];
  const ai = (me.expertise && me.expertise.ai) || [];
  if (!eng.length && !ai.length) return '';
  const col = (cls, title, sub, items) => items.length
    ? `<div class="col ${cls}"><div class="col-head"><span class="title">${title}</span>${sub ? `<span class="sub">${e(sub)}</span>` : ''}</div>${items.map(expertiseItem).join('')}</div>`
    : '';
  const engSub = stats.years ? `${stats.years} years${stats.preAiYears ? `, ${stats.preAiYears} of them before AI tools` : ''}` : '';
  const aiSub = `Since ${Math.floor(stats.aiEra)}: steering, verifying, shipping`;
  return `<section aria-labelledby="expertise">
<div class="section-head"><h2 class="eyebrow" id="expertise">Expertise</h2>${eng.length && ai.length ? '<span class="note">Engineering depth from before AI, next to how I work with it now.</span>' : ''}</div>
<div class="columns">${col('eng', 'Engineering', engSub, eng)}${col('ai', 'AI-native', aiSub, ai)}</div>
</section>`;
}

function signature(me) {
  const list = (me.highlights || []).slice(0, 3);
  if (!list.length) return '';
  const tags = (t) => (t && t.length ? `<span class="tags">${t.map((x) => `<span class="tag ${e(x)}">${e(TAG_LABEL[x] || x)}</span>`).join('')}</span>` : '');
  const cards = list.map((s, i) => `<a class="card" href="#s${i + 1}">${tags(s.tags)}<span class="title">${e(s.title)}</span>${s.hook ? `<span class="hook">${inline(s.hook)}</span>` : ''}<span class="foot"><span>${e(s.where || '')}</span><span class="cta">Read the story</span></span></a>`).join('');
  const panels = list.map((s, i) => {
    const ev = (s.evidence || []).map(evidence);
    return `<article class="story" id="s${i + 1}" aria-labelledby="s${i + 1}-title">
<div class="top"><div><span class="mono" style="font-size:13px;color:var(--muted)">${e([s.where, s.when].filter(Boolean).join(' · '))}</span><h3 id="s${i + 1}-title">${e(s.title)}</h3></div><a class="close" href="#signature" aria-label="Close story"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></a></div>
<div class="parts"><div><h4>The problem</h4><p>${inline(s.problem)}</p></div><div><h4>What I did</h4><p>${inline(s.did)}</p></div><div><h4>Outcome</h4><p>${inline(s.outcome)}</p></div></div>
${(s.stack && s.stack.length) || ev.length ? `<div class="bottom"><span class="tags">${(s.stack || []).map((x) => `<span class="chip">${e(x)}</span>`).join('')}</span><span class="evidence">${ev.map((x) => `<a href="${e(href(x.url))}">${e(x.label)}</a>`).join('')}</span></div>` : ''}
</article>`;
  }).join('\n');
  return `<section aria-labelledby="signature" id="signature-section">
<div class="section-head"><h2 class="eyebrow" id="signature">Signature work</h2><span class="note">${list.length === 1 ? 'The story' : `${['', 'One', 'Two', 'Three'][list.length]} stories`} I'd want you to ask me about</span></div>
<div class="cards">${cards}</div>
<div class="panels">${panels}</div>
</section>`;
}

export function employers(work) {
  const groups = [];
  for (const w of work || []) {
    let g = groups.find((x) => x.name === w.name);
    if (!g) groups.push((g = { name: w.name, url: w.url, summary: w.summary, roles: [], start: w.startDate, end: w.endDate }));
    g.roles.push(w);
    if (w.startDate < g.start) g.start = w.startDate;
    if (!w.endDate || (g.end && w.endDate > g.end)) g.end = w.endDate;
  }
  return groups;
}

function career(me, stats, now) {
  const groups = employers(me.work).sort((a, b) => toYear(a.start, now) - toYear(b.start, now));
  const products = (me.projects || []).filter((p) => p.startDate);
  if (!groups.length) return '';
  const starts = [...groups.map((g) => g.start), ...products.map((p) => p.startDate)].map((d) => toYear(d, now));
  const START = Math.floor(Math.min(...starts));
  const END = Math.floor(now) + 1;
  const pct = (y) => (((Math.min(Math.max(y, START), END) - START) / (END - START)) * 100).toFixed(2);
  const widthOf = (from, to) => (pct(toYear(to, now)) - pct(toYear(from, now))).toFixed(2);
  const step = Math.max(1, Math.ceil((END - START) / 5));
  const ticks = [];
  for (let y = START; y < END - 1; y += step) if (y < stats.aiEra - 1) ticks.push(y);
  const era = stats.aiEra < END ? pct(stats.aiEra) : null;

  const bars = groups.map((g) => `<a class="bar" href="#job-${slug(g.name)}" style="left:${pct(toYear(g.start, now))}%;width:calc(${widthOf(g.start, g.end)}% - 3px)" title="${e(g.name)}, ${span(g.start, g.end)}">${e(g.name)}</a>`).join('');
  // Overlapping products go on separate rows so each one stays visible.
  const rowEnds = [];
  const dots = [...products].sort((a, b) => toYear(a.startDate, now) - toYear(b.startDate, now)).map((p) => {
    const from = toYear(p.startDate, now);
    let row = rowEnds.findIndex((end) => end <= from);
    if (row === -1) row = rowEnds.push(0) - 1;
    rowEnds[row] = Math.max(toYear(p.endDate, now), from + 0.5);
    return `<span class="bar product" style="left:${pct(from)}%;width:calc(${widthOf(p.startDate, p.endDate)}% - 3px);top:${row * 44}px" title="${e(p.name)}, ${span(p.startDate, p.endDate)}">${e(p.name)}</span>`;
  }).join('');
  const panels = [...groups].reverse().map((g) => `<div class="job" id="job-${slug(g.name)}">
<div class="top"><h3>${g.url ? `<a href="${e(href(g.url))}" style="color:inherit">${e(g.name)}</a>` : e(g.name)}</h3><span class="top-right"><span class="period">${span(g.start, g.end)}</span><a class="close" href="#career" aria-label="Close"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></a></span></div>
<div class="rows">${g.roles.map((r) => `<div class="row"><span class="a">${e(r.position || '')}</span><span class="b">${r.summary ? inline(r.summary) : ''}${r.highlights && r.highlights.length ? `<ul>${r.highlights.map((h) => `<li>${inline(h)}</li>`).join('')}</ul>` : ''}</span></div>`).join('')}</div>
</div>`).join('\n');

  return `<section aria-labelledby="career">
<div class="section-head"><h2 class="eyebrow" id="career">Career</h2><span class="legend"><span><i></i>Employers</span>${products.length ? '<span><i class="dot"></i>Own products</span>' : ''}</span></div>
<div class="strip-scroll"><div class="strip">
${era ? `<span class="era" style="left:${era}%"></span>` : ''}
<div class="lane">${bars}</div>
${products.length ? `<div class="lane products" style="height:${rowEnds.length * 44 - 4}px">${dots}</div>` : ''}
<div class="axis">${ticks.map((y) => `<span style="left:${pct(y)}%">${y}</span>`).join('')}${era ? `<span class="era-label" style="left:calc(${era}% + 8px)">AI era →</span>` : ''}</div>
</div></div>
<div class="panels">${panels}</div>
</section>`;
}

function more(me, posts) {
  const blocks = [];
  const skills = me.skills || [];
  if (skills.length) {
    const all = skills.flatMap((s) => s.keywords || []);
    const meta = all.length > 6 ? `${all.slice(0, 6).join(', ')} and ${all.length - 6} more` : all.join(', ');
    blocks.push(['skills', 'Skills', meta, skills.map((s) => [e(s.name), e((s.keywords || []).join(', ') || s.level || '')])]);
  }
  const projects = me.projects || [];
  if (projects.length) {
    const live = projects.filter((p) => !p.endDate).length;
    blocks.push(['products', 'Own products', `${projects.length} built${live ? `, ${live} still running` : ''}`, projects.map((p) => [
      `${p.url ? `<a href="${e(href(p.url))}">${e(p.name)}</a>` : e(p.name)}<span style="font-weight:400;color:var(--muted)"> · ${span(p.startDate, p.endDate)}</span>`,
      inline(p.description || '')
    ])]);
  }
  if (posts.length) {
    blocks.push(['writing', 'Writing', `${posts.length} ${posts.length === 1 ? 'post' : 'posts'} · latest: ${e(posts[0].title)}`, posts.map((p) => [
      `<span class="mono" style="font-weight:400">${e(p.date || '')}</span>`,
      `<a href="posts/${e(p.slug)}/">${e(p.title)}</a>${p.summary ? ` · ${e(p.summary)}` : ''}`
    ])]);
  }
  const edu = me.education || [];
  if (edu.length) {
    const label = (x) => [x.studyType, x.area].filter(Boolean).join(', ');
    blocks.push(['education', 'Education', e([label(edu[0]), edu[0].institution].filter(Boolean).join(', ')), edu.map((x) => [
      `<span style="font-weight:500">${span(x.startDate, x.endDate)}</span>`,
      e([label(x), x.institution].filter(Boolean).join(', '))
    ])]);
  }
  if (!blocks.length) return '';
  return `<section class="more" aria-labelledby="more">
<h2 class="eyebrow" id="more">More, if you're curious</h2>
${blocks.map(([id, label, meta, rows]) => `<details id="${id}"><summary><span class="label">${label}</span><span class="meta">${meta}</span><span class="sign" aria-hidden="true"></span></summary><div class="rows">${rows.map(([a, b]) => `<div class="row"><span class="a">${a}</span><span class="b">${b}</span></div>`).join('')}</div></details>`).join('\n')}
</section>`;
}

function footer(me, root, builtAt) {
  const repo = me.meta && me.meta.me && me.meta.me.repo;
  return `<footer class="site wrap"><span>Made with {me}${repo ? ` from <a href="${e(repo)}">${e(hostOf(repo))}</a>` : ''} · updated ${longDate(builtAt.toISOString().slice(0, 10))}</span><span class="files"><a href="${root}me.json">/me.json</a><a href="${root}llms.txt">/llms.txt</a><a href="${root}cv.md">/cv.md</a></span></footer>`;
}

export function renderProfile(me, posts, { siteUrl = '', builtAt = new Date() } = {}) {
  const b = me.basics;
  const now = nowYear(builtAt);
  const stats = careerStats(me, now);
  const where = [b.location && b.location.city, b.location && (b.location.country || b.location.countryCode)].filter(Boolean).join(', ');
  const meta = [b.label, where].filter(Boolean).join(' · ');
  const prompt = `Read {url}. It is ${b.name}'s CV. Tell me where they would be strongest on my team, which of their stories to ask about in an interview, and what is missing.`;
  const body = `<div class="topbar wrap"><span class="mono">${e(hostOf(siteUrl))}</span><span class="actions">
<button class="btn" type="button" data-ask="${e(prompt)}" hidden><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg><span>Ask your AI about me</span></button>
<button class="btn" type="button" data-print hidden>PDF</button>
</span></div>
<main class="profile wrap">
<header class="intro">
<div class="who">${avatar(b, '')}<div><div class="name">${e(b.name)}</div>${meta ? `<div class="meta">${e(meta)}</div>` : ''}</div></div>
${me.headline ? `<h1 class="headline">${e(me.headline)}</h1>` : `<h1 class="headline">${e(b.name)}</h1>`}
${b.summary && !me.headline ? `<p class="summary">${inline(b.summary)}</p>` : ''}
${facts(me, stats)}
</header>
${expertise(me, stats)}
${signature(me)}
${career(me, stats, now)}
${more(me, posts)}
</main>
${footer(me, '', builtAt)}`;
  return page({ title: `${b.name}${b.label ? ` · ${b.label}` : ''}`, description: me.headline || b.summary, root: '', body, canonical: siteUrl || undefined });
}

export function renderPost(me, post, { siteUrl = '', builtAt = new Date() } = {}) {
  const root = '../../';
  const b = me.basics;
  const repo = me.meta && me.meta.me && me.meta.me.repo;
  const minutes = Math.max(1, Math.round(post.words / 220));
  const body = `<nav class="post-nav wrap"><a class="home" href="${root}">${avatar(b, root)}<span>${e(b.name)}</span></a><span class="links"><a href="${root}">CV</a><a href="${root}#writing">Writing</a></span></nav>
<article class="post wrap">
<header><div class="date">${post.date ? `${e(longDate(post.date))} · ` : ''}${minutes} min read</div><h1>${e(post.title)}</h1>${post.tags.length ? `<div class="tags">${post.tags.map((t) => `<span class="chip">${e(t)}</span>`).join('')}</div>` : ''}</header>
<div class="prose">${markdown(post.body, { shift: post.topHeading })}</div>
</article>
<div class="post-foot wrap"><div><a class="back" href="${root}#writing"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>All writing</a>${repo ? `<a class="edit" href="${e(`${repo.replace(/\/$/, '')}/edit/HEAD/posts/${post.file}`)}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z"/></svg>Suggest an edit</a>` : ''}</div></div>
${footer(me, root, builtAt)}`;
  return page({ title: `${post.title} · ${b.name}`, description: post.summary, root, body, canonical: siteUrl ? `${siteUrl}posts/${post.slug}/` : undefined });
}
