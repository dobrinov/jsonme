import { escapeHtml as e, markdown, inline, safeUrl } from './markdown.mjs';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TAG_LABEL = { depth: 'Depth', leadership: 'Leadership', product: 'Product', ai: 'AI era' };
// Theme switch, shown by me.js. Auto follows the system; a choice is kept in localStorage.
const THEME_SWITCH = `<span class="theme" role="group" aria-label="Theme" hidden>${[
  ['auto', 'Auto', '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'],
  ['light', 'Light', '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'],
  ['dark', 'Dark', '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>']
].map(([id, label, icon]) => `<button type="button" aria-pressed="${id === 'auto'}" data-theme-choice="${id}"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon}</svg><span>${label}</span></button>`).join('')}</span>`;
// Applies a saved theme before first paint so the page does not flash.
const THEME_BOOT = '<script>try{var t=localStorage.getItem("me-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}</script>';
// The {me} project page: the footer of every generated site links to it.
const HOME = 'https://dobrinov.github.io/jsonme/';
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
// A bare domain gets https://; any other scheme than http(s) or mailto is dropped.
const href = (url) => safeUrl(/^[a-z][\w+.-]*:|^[/#.]/i.test(String(url).trim()) ? url : `https://${String(url).trim()}`);
const hostOf = (url) => String(url).replace(/^https?:\/\//, '').replace(/\/$/, '');
const evidence = (x) => (typeof x === 'string' ? { url: x, label: hostOf(x) } : { url: x.url, label: x.label || hostOf(x.url) });

function avatar(basics, root) {
  if (!basics.image) return `<span class="avatar" aria-hidden="true">${e(initials(basics.name))}</span>`;
  const src = /^[a-z][\w+.-]*:|^\//i.test(basics.image) ? safeUrl(basics.image) : root + basics.image;
  return `<img class="avatar" src="${e(src)}" alt="" width="64" height="64">`;
}

// Open Graph and Twitter tags, so a shared link shows a card. og:image needs an absolute URL.
function social({ title, description, canonical, type, image, siteName, published }) {
  const tags = [
    ['og:type', type], ['og:title', title], ['og:description', description], ['og:url', canonical],
    ['og:image', image], ['og:image:alt', image && siteName], ['og:site_name', siteName], ['article:published_time', published]
  ].filter(([, v]) => v).map(([k, v]) => `<meta property="${k}" content="${e(v)}">`);
  tags.push(`<meta name="twitter:card" content="summary">`);
  if (image) tags.push(`<meta name="twitter:image" content="${e(image)}">`);
  return tags.join('\n') + '\n';
}

function absoluteImage(b, siteUrl) {
  if (!b.image) return '';
  if (/^https?:\/\//i.test(b.image)) return safeUrl(b.image);
  return siteUrl ? siteUrl + b.image.replace(/^\//, '') : '';
}

// Plausible analytics: the script URL from meta.me.plausible, plus Plausible's own queue stub.
function analytics(me) {
  const url = me && me.meta && me.meta.me && me.meta.me.plausible;
  if (!url || !/^https:\/\//i.test(url)) return '';
  return `<script async src="${e(url)}"></script>
<script>window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()</script>
`;
}

// Every link to another site opens in a new tab. Links within the site, anchors and mailto: stay as they are.
export function externalLinks(html) {
  return html.replace(/<a ([^>]*?)href="(https?:\/\/[^"]*)"([^>]*)>/g, (tag, before, url, after) => {
    if (/\btarget=/.test(before + after)) return tag;
    const attrs = before + after;
    const rel = attrs.match(/\brel="([^"]*)"/);
    const withRel = rel
      ? tag.replace(rel[0], `rel="${rel[1].split(' ').includes('noopener') ? rel[1] : `${rel[1]} noopener`}"`)
      : tag.replace(/>$/, ' rel="noopener">');
    return withRel.replace(/>$/, ' target="_blank">');
  });
}

function page({ title, description, root, body, canonical, og, me }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
${THEME_BOOT}
<title>${e(title)}</title>
${description ? `<meta name="description" content="${e(description)}">\n` : ''}${canonical ? `<link rel="canonical" href="${e(canonical)}">\n` : ''}${og ? social({ title, description, canonical, ...og }) : ''}<link rel="icon" href="${root}favicon.ico" sizes="32x32">
<link rel="icon" href="${root}assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${root}assets/apple-touch-icon.png">
<link rel="alternate" type="application/json" href="${root}me.json">
<link rel="alternate" type="application/rss+xml" href="${root}feed.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="${root}assets/me.css">
${analytics(me)}</head>
<body>
${externalLinks(body)}
<script src="${root}assets/me.js" defer></script>
</body>
</html>
`;
}

export function careerStats(me, now) {
  const starts = (me.work || []).map((w) => toYear(w.startDate, now));
  const first = starts.length ? Math.min(...starts) : null;
  // Nothing about AI shows unless the CV has an AI story: AI expertise, an AI-tagged story, a product built
  // or revived with AI, LLM patterns, or an explicit aiEraStart.
  const set = me.meta && me.meta.me && me.meta.me.aiEraStart;
  const hasAi = Boolean(set || (me.expertise && me.expertise.ai && me.expertise.ai.length)
    || (me.highlights || []).some((h) => (h.tags || []).includes('ai'))
    || (me.projects || []).some((p) => p.vibecoded || p.revivedDate)
    || (me.llms && me.llms.patterns && me.llms.patterns.length));
  const aiEra = hasAi ? toYear(set || '2023-01', now) : Infinity;
  return {
    first,
    aiEra,
    years: first == null ? 0 : Math.floor(now - first),
    preAiYears: first == null || !hasAi ? 0 : Math.max(0, Math.floor(aiEra - first))
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

// How I use LLMs: patterns found in the person's own prompts, grouped by the goal they serve.
const GOALS = { planning: 'Planning', designing: 'Designing', building: 'Building', reviewing: 'Reviewing', debugging: 'Debugging', research: 'Learning', writing: 'Writing', operating: 'Operating' };
function llms(me) {
  const l = me.llms;
  const list = (l && l.patterns) || [];
  if (!list.length) return '';
  const how = l.prompt || 'https://dobrinov.github.io/jsonme/patterns-prompt.md';
  // Overview first: one row of pattern names per goal. Each name opens a popover with the detail.
  const order = [...Object.keys(GOALS), ''];
  const groups = order.map((g) => [g, list.filter((p) => (GOALS[p.goal] ? p.goal : '') === g)]).filter(([, ps]) => ps.length);
  const ids = new Map(list.map((p, i) => [p, `llm-${i + 1}`]));
  const label = (g) => (g ? GOALS[g] : groups.length === 1 ? 'Patterns' : 'Other');
  const rows = groups.map(([g, ps]) => `<div class="llm-row"><span class="llm-goal">${label(g)}</span><span class="llm-chips">${ps.map((p) => `<button type="button" class="llm-chip" popovertarget="${ids.get(p)}">${e(p.name)}</button>`).join('')}</span></div>`).join('');
  const pops = list.map((p) => `<div class="pop llm-pop" id="${ids.get(p)}" popover>
<div class="pop-head"><div><h3>${e(p.name)}</h3><span class="period">${e(GOALS[p.goal] || 'How I use LLMs')}${p.share != null ? ` · ${e(String(p.share))}% of my prompts` : ''}</span></div><button type="button" class="pop-close" popovertarget="${ids.get(p)}" popovertargetaction="hide" aria-label="Close">${CLOSE}</button></div>
${p.how ? `<p class="pop-lead">${inline(p.how)}</p>` : ''}${p.achieves ? `<div class="pop-item"><span class="t">What it achieves</span><p>${inline(p.achieves)}</p></div>` : ''}${p.example ? `<blockquote>“${e(p.example)}”</blockquote>` : ''}${p.limit ? `<p class="pop-lead"><b>Where it falls short:</b> ${e(p.limit)}</p>` : ''}
</div>`).join('');
  return `
<section class="llms" aria-labelledby="llms">
<div class="section-head"><h2 class="eyebrow" id="llms">How I use LLMs</h2><span class="note">${l.source ? `Patterns an LLM found in ${e(l.source)}. ` : ''}<a href="${e(href(how))}">The prompt it used</a></span></div>
<div class="llm-rows">${rows}</div>
${l.gap ? `<p class="gap"><b>A gap it found:</b> ${inline(l.gap)}</p>` : ''}
<div class="pops">${pops}</div>
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

const monthYear = (d) => {
  if (!d) return 'now';
  const [y, m] = String(d).split('-');
  return m ? `${MONTHS[Number(m) - 1]} ${y}` : y;
};
const duration = (from, to, now) => {
  const months = Math.max(1, Math.round((toYear(to, now) - toYear(from, now)) * 12));
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y && `${y}y`, m && `${m}m`].filter(Boolean).join(' ');
};
const CLOSE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

// Minimum width in px of a bar that runs to the present, so a star at its start leaves some bar visible.
const MIN_LIVE = 28;
const STAR = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></svg>';
const ARROW = (d) => `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;

function career(me, stats, now) {
  const jobs = employers(me.work).sort((a, b) => toYear(a.start, now) - toYear(b.start, now));
  const products = (me.projects || []).filter((p) => p.startDate).sort((a, b) => toYear(a.startDate, now) - toYear(b.startDate, now));
  const schools = (me.education || []).filter((x) => x.startDate).sort((a, b) => toYear(a.startDate, now) - toYear(b.startDate, now));
  if (!jobs.length && !products.length) return '';
  const starts = [...jobs.map((g) => g.start), ...products.map((p) => p.startDate), ...schools.map((x) => x.startDate)].map((d) => toYear(d, now));
  const START = Math.floor(Math.min(...starts));
  const END = Math.floor(now) + 1;
  const pos = (y) => ((Math.min(Math.max(y, START), END) - START) / (END - START)) * 100;
  const fixed = (n) => n.toFixed(2);
  const at = (d) => pos(toYear(d, now));
  const stories = (me.highlights || []).slice(0, 3).map((s, i) => ({ ...s, id: `s${i + 1}` }));
  // Links in the timeline open in a new tab; story links stay on the page.
  const NEW_TAB = ' target="_blank" rel="noopener"';
  const md = (t) => inline(t, NEW_TAB);
  const range = (from, to) => `${monthYear(from)} – ${monthYear(to)} · ${duration(from, to, now)}`;
  const tipEdge = (y) => (pos(y) < 4 ? ' tip-start' : pos(y) > 96 ? ' tip-end' : '');

  // One bar per span. The track is a fixed number of pixels per year, so finished spans under ~2.5 months become
  // a dot. Ongoing spans always get a bar that reaches the present, however short, so they read as alive.
  // A star sits on the left edge of an ongoing bar; for very recent starts both are kept clear of the now edge.
  const starLeft = (at, ongoing) => (ongoing ? `min(${fixed(pos(at))}%, calc(${fixed(pos(now))}% - ${MIN_LIVE}px))` : `${fixed(pos(at))}%`);
  const segment = (target, from, to, { cls, text, tip, minYears = 0.45, role }) => {
    const a = toYear(from, now);
    const b = toYear(to, now);
    const L = pos(a);
    const W = pos(b) - L;
    const mid = L + W / 2;
    const attrs = `type="button" popovertarget="${target}"${role == null ? '' : ` data-role="${role}"`} data-tip="${e(tip)}" aria-label="${e(tip)}"`;
    if (to && b - a < 0.2) return `<button class="dot ${cls}${tipEdge((a + b) / 2)}" ${attrs} style="left:${fixed(mid)}%"></button><span class="dot-label" style="left:calc(${fixed(mid)}% + 14px)" aria-hidden="true">${e(duration(from, to, now))}</span>`;
    return `<button class="seg ${cls}${tipEdge((a + b) / 2)}" ${attrs} style="${to ? `left:${fixed(L)}%;width:calc(${fixed(W)}% - 2px)` : `right:${fixed(100 - pos(b))}%;width:max(calc(${fixed(W)}% - 2px), ${MIN_LIVE}px)`}"><span class="seg-text">${b - a >= minYears ? e(text) : ''}</span></button>`;
  };
  const row = (id, name, sub, segments) => `<div class="tl-row"><button type="button" class="tl-who" popovertarget="${id}"><span class="n">${e(name)}</span><span class="s">${e(sub)}</span></button><div class="track">${era == null ? '' : `<span class="era" style="left:${fixed(era)}%;right:${fixed(100 - pos(now))}%"></span>`}${segments}</div></div>`;
  const item = (title, from, to, body, story, n, cls = '') => `<div class="pop-item${cls}" data-item="${n}"><div class="pop-item-head"><span class="t">${title || ''}</span><span class="period">${range(from, to)}</span></div>${body}${story ? `<a class="story-link" href="#${story.id}">Signature work: ${e(story.title)} →</a>` : ''}</div>`;
  const popover = (id, cls, name, link, from, to, items) => {
    const url = link && href(link) !== '#' ? link : '';
    return `<div class="pop ${cls}" id="${id}" popover>
<div class="pop-head"><div><h3>${url ? `<a href="${e(href(url))}"${NEW_TAB}>${e(name)}</a>` : e(name)}</h3><span class="period">${range(from, to)}</span></div><button type="button" class="pop-close" popovertarget="${id}" popovertargetaction="hide" aria-label="Close">${CLOSE}</button></div>
${items}${url ? `<a class="site" href="${e(href(url))}"${NEW_TAB}>${e(hostOf(url))} ↗</a>` : ''}
</div>`;
  };
  const era = stats.aiEra < END ? pos(stats.aiEra) : null;
  // Consecutive equal values collapse: Team lead, Team lead -> Team lead.
  const squash = (list) => list.filter((x, i) => x !== list[i - 1]);

  const rows = [];
  const pops = [];
  if (jobs.length) rows.push('<p class="tl-group">Work</p>');
  for (const g of jobs) {
    const id = `job-${slug(g.name)}`;
    // Roles are drawn as steps only when their start dates tell them apart; me.json lists them newest first.
    const asc = [...g.roles].sort((a, b) => toYear(a.startDate, now) - toYear(b.startDate, now));
    const steps = asc.length > 1 && new Set(asc.map((r) => r.startDate)).size === asc.length;
    const path = steps ? asc : [...g.roles].reverse();
    const order = [...path].reverse();
    const ends = new Map(asc.map((r, i) => [r, steps ? (asc[i + 1] ? asc[i + 1].startDate : g.end) : r.endDate || g.end]));
    const sub = g.roles.length > 1 ? squash(path.map((r) => r.position).filter(Boolean)).join(' → ') : `${g.roles[0].position || ''} · ${duration(g.start, g.end, now)}`;
    // The bar shows title changes only; a change of scope under the same title shows in the popover.
    const bars = [];
    if (steps) for (const r of asc) {
      const last = bars[bars.length - 1];
      if (last && last.position === r.position) { last.to = ends.get(r); last.role = r; } else bars.push({ position: r.position, from: r.startDate, to: ends.get(r), role: r });
    }
    const segments = steps
      ? bars.map((b, i) => segment(id, b.from, b.to, { cls: `job r${Math.min(i, 2) + 1}`, text: b.position, tip: `${b.position} · ${range(b.from, b.to)}`, minYears: 0.9, role: order.indexOf(b.role) })).join('')
      : segment(id, g.start, g.end, { cls: 'job mono', text: duration(g.start, g.end, now), tip: `${g.name} · ${range(g.start, g.end)}` });
    rows.push(row(id, g.name, sub, segments));

    let items;
    if (g.roles.length === 1) {
      const r = g.roles[0];
      const story = stories.find((s) => s.where === g.name);
      items = item(e(r.position), r.startDate || g.start, r.endDate || g.end, `${r.summary ? `<p>${md(r.summary)}</p>` : ''}${r.highlights && r.highlights.length ? `<ul>${r.highlights.map((h) => `<li>${md(h)}</li>`).join('')}</ul>` : ''}`, story, 0);
    } else {
      // A growth path, oldest step first: each role with what was built in it. A story belongs to the role whose
      // scope matches its "when", else to the latest role with that title, preferring one without a scope.
      const latestFirst = [...path].reverse();
      const own = (s) => latestFirst.find((r) => r.scope === s.when) || latestFirst.find((r) => !r.scope && r.position === s.when) || latestFirst.find((r) => r.position === s.when);
      items = `<ol class="growth">${path.map((r, i) => {
        const latest = i === path.length - 1;
        const when = steps ? (latest ? `${monthYear(r.startDate)} – ${monthYear(g.end)}` : monthYear(r.startDate)) : r.endDate ? `${monthYear(r.startDate)} – ${monthYear(r.endDate)}` : '';
        const title = r.scope ? `${e(r.scope)}<span class="was">${e(r.position || '')}</span>` : e(r.position || '');
        const linked = stories.filter((s) => s.where === g.name && own(s) === r);
        const lines = [...(r.highlights || []).map((h) => `<li>${md(h)}</li>`), ...linked.map((s) => `<li>${e(s.title)} · <a href="#${s.id}">Story →</a></li>`)];
        return `<li class="step${latest ? ' now' : ''}" data-item="${order.indexOf(r)}"><div class="step-head"><span class="t">${title}</span>${when ? `<span class="period">${when}</span>` : ''}</div>${r.summary ? `<p>${md(r.summary)}</p>` : ''}${lines.length ? `<ul>${lines.join('')}</ul>` : ''}</li>`;
      }).join('')}</ol>`;
    }
    pops.push(popover(id, 'job-pop', g.name, g.url, g.start, g.end, items));
  }

  if (products.length) rows.push('<p class="tl-group">Own products</p>');
  for (const p of products) {
    const id = `product-${slug(p.name)}`;
    const story = stories.find((s) => s.title.toLowerCase().includes(p.name.toLowerCase()));
    if (p.vibecoded && !p.revivedDate) {
      // Vibe-coded from the start: a star where it starts, and a hatched bar once it is long enough to draw one.
      const from = toYear(p.startDate, now);
      const short = Boolean(p.endDate) && toYear(p.endDate, now) - from < 0.2;
      const tip = `Vibe-coded · ${range(p.startDate, p.endDate)}`;
      const star = short ? (from + toYear(p.endDate, now)) / 2 : from;
      rows.push(row(id, p.name, `Vibe-coded · ${duration(p.startDate, p.endDate, now)}`, [
        short ? '' : segment(id, p.startDate, p.endDate, { cls: 'product ai mono', text: duration(p.startDate, p.endDate, now), tip }),
        `<button class="revival${tipEdge(star)}" type="button" popovertarget="${id}" data-tip="${e(tip)}" aria-label="${e(tip)}" style="left:${starLeft(star, !p.endDate)}">${STAR}</button>`,
        short ? `<span class="dot-label" style="left:calc(${fixed(pos(star))}% + 14px)" aria-hidden="true">${e(duration(p.startDate, p.endDate, now))}</span>` : ''
      ].join('')));
      pops.push(popover(id, 'product-pop', p.name, p.url, p.startDate, p.endDate, [
        p.description ? `<p class="pop-lead">${md(p.description)}</p>` : '',
        item(`<span class="star">${STAR}</span>Vibe-coded`, p.startDate, p.endDate, '', story, 0, ' ai')
      ].join('')));
      continue;
    }
    if (!p.revivedDate) {
      rows.push(row(id, p.name, duration(p.startDate, p.endDate, now), segment(id, p.startDate, p.endDate, { cls: 'product mono', text: duration(p.startDate, p.endDate, now), tip: `${p.name} · ${range(p.startDate, p.endDate)}` })));
      pops.push(popover(id, 'product-pop', p.name, p.url, p.startDate, p.endDate, item('Own product', p.startDate, p.endDate, p.description ? `<p>${md(p.description)}</p>` : '', story, 0)));
      continue;
    }
    // Built by hand, paused, then revived with AI: a bar, a dashed gap, and a star where the revival starts.
    const handEnd = p.pausedDate || p.revivedDate;
    const revived = toYear(p.revivedDate, now);
    const tip = `Revived with AI · ${range(p.revivedDate, p.endDate)}`;
    const segments = [
      segment(id, p.startDate, handEnd, { cls: 'product mono', text: duration(p.startDate, handEnd, now), tip: `Built by hand · ${range(p.startDate, handEnd)}`, role: 0 }),
      p.pausedDate ? `<span class="paused" style="left:${fixed(at(p.pausedDate))}%;width:${fixed(at(p.revivedDate) - at(p.pausedDate))}%" aria-hidden="true"></span>` : '',
      !p.endDate || toYear(p.endDate, now) - revived >= 0.2 ? segment(id, p.revivedDate, p.endDate, { cls: 'product ai mono', text: duration(p.revivedDate, p.endDate, now), tip, role: 1 }) : '',
      `<button class="revival${tipEdge(revived)}" type="button" popovertarget="${id}" data-role="1" data-tip="${e(tip)}" aria-label="${e(tip)}" style="left:${starLeft(revived, !p.endDate)}">${STAR}</button>`
    ].join('');
    rows.push(row(id, p.name, `By hand ${year(p.startDate)} · revived with AI ${year(p.revivedDate)}`, segments));
    pops.push(popover(id, 'product-pop', p.name, p.url, p.startDate, p.endDate, [
      p.description ? `<p class="pop-lead">${md(p.description)}</p>` : '',
      item('Built by hand', p.startDate, handEnd, '', story, 0),
      item(`<span class="star">${STAR}</span>Revived with AI`, p.revivedDate, p.endDate, p.revival ? `<p>${md(p.revival)}</p>` : '', null, 1, ' ai')
    ].join('')));
  }

  if (schools.length) rows.push('<p class="tl-group">Education</p>');
  for (const x of schools) {
    const id = `edu-${slug(x.institution)}`;
    const study = [x.studyType, x.area].filter(Boolean).join(', ');
    rows.push(row(id, x.institution, study, segment(id, x.startDate, x.endDate, { cls: 'edu mono', text: duration(x.startDate, x.endDate, now), tip: `${x.institution} · ${range(x.startDate, x.endDate)}` })));
    pops.push(popover(id, 'edu-pop', x.institution, x.url, x.startDate, x.endDate, item(e(study), x.startDate, x.endDate, '', null, 0)));
  }

  const ticks = [];
  for (let y = START; y < END; y += 1) if (era == null || Math.abs(y - stats.aiEra) >= 0.75) ticks.push(y);
  const summary = [
    stats.years && `${stats.years} years shipping software`,
    jobs.length && `${jobs.length} ${jobs.length === 1 ? 'employer' : 'employers'}`,
    products.length && `${products.length} own ${products.length === 1 ? 'product' : 'products'}`
  ].filter(Boolean).join(' · ');
  const revivals = products.some((p) => p.revivedDate);
  const vibecoded = products.some((p) => p.vibecoded && !p.revivedDate);
  const starKey = revivals && vibecoded ? 'Vibe-coded or revived with AI' : vibecoded ? 'Vibe-coded' : 'Revived with AI';

  return `<section aria-labelledby="career">
<div class="section-head"><h2 class="eyebrow" id="career">Career</h2><span class="legend">${jobs.length ? '<span><i></i>Employers</span>' : ''}${products.length ? '<span><i class="product"></i>Own products</span>' : ''}${revivals ? '<span><i class="paused-key"></i>Paused</span>' : ''}${revivals || vibecoded ? `<span><span class="star">${STAR}</span>${starKey}</span>` : ''}${schools.length ? '<span><i class="edu"></i>Education</span>' : ''}${era == null ? '' : '<span><i class="era-key"></i>AI era</span>'}</span></div>
<div class="tl-top">${summary ? `<p class="tl-summary">${e(summary)}</p>` : ''}<span class="tl-jump" hidden><button type="button" data-tl="prev">${ARROW('M10 3L5 8l5 5')}Earlier</button><button type="button" data-tl="next">Now${ARROW('M6 3l5 5-5 5')}</button></span></div>
<p class="tl-hint">Hover a bar for dates. Click a bar or a name for the full story. Scroll the timeline for earlier years.</p>
<div class="tl-frame">
<div class="timeline-scroll"><div class="timeline" style="--years:${END - START}">
${rows.join('\n')}
<div class="tl-row tl-axis"><span></span><div class="axis">${ticks.map((y) => `<span style="left:${fixed(pos(y))}%">${y}</span>`).join('')}${era == null ? '' : `<span class="era-label" style="left:calc(${fixed(era)}% + 6px)">AI era →</span>`}</div></div>
</div></div>
<button type="button" class="tl-edge prev" data-tl="prev" aria-label="Show earlier years" hidden>${ARROW('M10 3L5 8l5 5')}</button><button type="button" class="tl-edge next" data-tl="next" aria-label="Back to now" hidden>${ARROW('M6 3l5 5-5 5')}</button>
</div>
<div class="pops">${pops.join('\n')}</div>
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

// Email, website and profiles (JSON Resume basics), as round buttons beside the name. Email keeps its word;
// the rest are icons with a tooltip, and print shows each link's address instead.
const CONTACT_ICONS = {
  email: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  website: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>',
  github: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4M9 18c-4.51 2-5-2-7-2"/>',
  linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>',
  x: '<path d="M4 4l16 16M20 4L4 20"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>'
};
const contactIcon = (kind) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${CONTACT_ICONS[kind]}</svg>`;
const networkIcon = (network) => {
  const n = String(network || '').toLowerCase();
  return n === 'twitter' ? 'x' : CONTACT_ICONS[n] && n !== 'email' && n !== 'website' ? n : 'link';
};

function contact(b) {
  const links = [
    b.url && { url: href(b.url), label: 'Website', icon: 'website' },
    ...(b.profiles || []).filter((p) => p.url).map((p) => ({ url: href(p.url), label: p.network || hostOf(p.url), icon: networkIcon(p.network) }))
  ].filter((l) => l && l.url !== '#');
  const mail = b.email ? `<a class="mail" href="mailto:${e(b.email)}" data-tip="${e(b.email)}">${contactIcon('email')}<span class="screen">Email</span><span class="print">${e(b.email)}</span></a>` : '';
  const icons = links.map((l) => `<a class="icon" href="${e(l.url)}" rel="me noopener" target="_blank" aria-label="${e(l.label)}" data-tip="${e(hostOf(l.url))}">${contactIcon(l.icon)}<span class="print" aria-hidden="true">${e(hostOf(l.url))}</span></a>`).join('');
  return mail || icons ? `<div class="contact">${mail}${icons}</div>` : '';
}

function footer(me, root, builtAt) {
  const repo = me.meta && me.meta.me && me.meta.me.repo;
  return `<footer class="site wrap"><span>Made by <a href="${HOME}">{me}</a>${repo ? ` from <a href="${e(href(repo))}">${e(hostOf(repo))}</a>` : ''} · updated ${longDate(builtAt.toISOString().slice(0, 10))}</span><span class="files"><a href="${root}me.json">/me.json</a><a href="${root}llms.txt">/llms.txt</a><a href="${root}cv.md">/cv.md</a></span></footer>`;
}

export function renderProfile(me, posts, { siteUrl = '', builtAt = new Date() } = {}) {
  const b = me.basics;
  const now = nowYear(builtAt);
  const stats = careerStats(me, now);
  const where = [b.location && b.location.city, b.location && (b.location.country || b.location.countryCode)].filter(Boolean).join(', ');
  // "Team lead at Dext": the name of a current employer that has a url becomes a link.
  const employer = (me.work || []).find((w) => !w.endDate && w.url && b.label && b.label.includes(w.name));
  const label = b.label ? (employer ? b.label.split(employer.name).map(e).join(`<a href="${e(href(employer.url))}">${e(employer.name)}</a>`) : e(b.label)) : '';
  const meta = [label, e(where)].filter(Boolean).join(' · ');
  const prompt = `Read {url}. It is ${b.name}'s CV. Tell me where they would be strongest on my team, which of their stories to ask about in an interview, and what is missing.`;
  const body = `<div class="topbar wrap"><span class="mono">${e(hostOf(siteUrl))}</span><span class="actions">
${THEME_SWITCH}
<button class="btn" type="button" data-ask="${e(prompt)}" hidden><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg><span>Ask your AI about me</span></button>
</span></div>
<main class="profile wrap">
<header class="intro">
<div class="who"><div class="id">${avatar(b, '')}<div><div class="name">${e(b.name)}</div>${meta ? `<div class="meta">${meta}</div>` : ''}</div></div>${contact(b)}</div>
${me.headline ? `<h1 class="headline">${e(me.headline)}</h1>` : `<h1 class="headline">${e(b.name)}</h1>`}
${b.summary && !me.headline ? `<p class="summary">${inline(b.summary)}</p>` : ''}
${facts(me, stats)}
</header>
${expertise(me, stats)}${llms(me)}
${signature(me)}
${career(me, stats, now)}
${more(me, posts)}
</main>
${footer(me, '', builtAt)}`;
  return page({ title: `${b.name}${b.label ? ` · ${b.label}` : ''}`, description: me.headline || b.summary, root: '', body, canonical: siteUrl || undefined,
    og: { type: 'profile', image: absoluteImage(b, siteUrl), siteName: b.name }, me });
}

export function renderPost(me, post, { siteUrl = '', builtAt = new Date() } = {}) {
  const root = '../../';
  const b = me.basics;
  const repo = me.meta && me.meta.me && me.meta.me.repo;
  const minutes = Math.max(1, Math.round(post.words / 220));
  const body = `<nav class="post-nav wrap"><a class="home" href="${root}">${avatar(b, root)}<span>${e(b.name)}</span></a><span class="links"><a href="${root}">CV</a><a href="${root}#writing">Writing</a>${THEME_SWITCH}</span></nav>
<article class="post wrap">
<header><div class="date">${post.date ? `${e(longDate(post.date))} · ` : ''}${minutes} min read</div><h1>${e(post.title)}</h1>${post.tags.length ? `<div class="tags">${post.tags.map((t) => `<span class="chip">${e(t)}</span>`).join('')}</div>` : ''}</header>
<div class="prose">${markdown(post.body, { shift: post.topHeading })}</div>
</article>
<div class="post-foot wrap"><div><a class="back" href="${root}#writing"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>All writing</a>${repo ? `<a class="edit" href="${e(href(`${repo.replace(/\/$/, '')}/edit/HEAD/posts/${post.file}`))}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z"/></svg>Suggest an edit</a>` : ''}</div></div>
${footer(me, root, builtAt)}`;
  return page({ title: `${post.title} · ${b.name}`, description: post.summary, root, body, canonical: siteUrl ? `${siteUrl}posts/${post.slug}/` : undefined,
    og: { type: 'article', image: absoluteImage(b, siteUrl), siteName: b.name, published: post.date || '' }, me });
}
