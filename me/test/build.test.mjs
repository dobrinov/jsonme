import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from '../src/build.mjs';
import { migrate, isLegacy } from '../src/migrate.mjs';
import { validate } from '../src/validate.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const quiet = { warn() {}, error() {} };
const builtAt = new Date('2026-10-25T00:00:00Z');

test('migrates the legacy jsonme format', async () => {
  const old = JSON.parse(await readFile(join(ROOT, 'test/legacy-me.json'), 'utf8'));
  assert.ok(isLegacy(old));
  const me = migrate(old);
  assert.equal(me.basics.name, 'Deyan Dobrinov');
  assert.equal(me.basics.label, 'Development lead at Dext');
  assert.equal(me.work.length, 6);
  assert.equal(me.work[0].startDate, '2016-05');
  assert.equal(me.work[0].endDate, undefined);
  assert.equal(me.projects.find((p) => p.name === 'Carpass').endDate, '2020-08');
  assert.equal(me.skills[0].keywords.length, 14);
  assert.deepEqual(validate(me).errors, []);
});

test('validation rules', () => {
  assert.deepEqual(validate({}).errors, ['basics.name is required']);
  const four = Array(4).fill({ title: 't', problem: 'p', did: 'd', outcome: 'o' });
  assert.ok(validate({ basics: { name: 'A' }, highlights: four }).errors.some((e) => e.includes('best 3')));
  assert.ok(validate({ basics: { name: 'A' }, expertise: { ai: [{ name: 'x' }] } }).errors.some((e) => e.includes('one-line proof')));
  assert.ok(validate({ basics: { name: 'A' }, work: [{ name: 'X', startDate: '05-2016' }] }).errors.some((e) => e.includes('YYYY')));
});

test('builds the example site', async () => {
  const out = await mkdtemp(join(tmpdir(), 'me-'));
  const result = await build({ src: join(ROOT, 'examples/dobrinov'), out, siteUrl: 'https://dobrinov.github.io/me', repo: 'https://github.com/dobrinov/me', builtAt, log: quiet });
  assert.equal(result.posts, 1);

  const index = await readFile(join(out, 'index.html'), 'utf8');
  assert.match(index, /<h1 class="headline">I find the simple solution hiding inside complex systems.<\/h1>/);
  assert.equal((index.match(/class="card"/g) || []).length, 3);
  assert.match(index, /popovertarget="job-dext"/);
  assert.match(index, /id="job-dext" popover/);
  assert.match(index, /data-theme-choice="dark"/);
  assert.match(index, /localStorage.getItem\("me-theme"\)/, "a saved theme is applied before paint");
  assert.match(await readFile(join(out, "assets/me.css"), "utf8"), /prefers-color-scheme: dark/);
  assert.match(index, /class="dot product[^"]*" type="button" popovertarget="product-dev-wanted"/, "a one-month product is a dot");
  assert.match(index, /data-tip="DEV wanted · May 2018 – Jun 2018 · 1m"/);
  assert.match(index, /href="posts\/hello-blogging\/"/);
  assert.match(index, /class="col ai"/, 'the AI column is rendered');
  assert.match(index, /id="llms"/, 'How I use LLMs is rendered');

  const post = await readFile(join(out, 'posts/hello-blogging/index.html'), 'utf8');
  assert.match(post, /<h1>How to blog with {me}<\/h1>/);
  assert.match(post, /<h2>Before you start<\/h2>/);
  assert.match(post, /github\.com\/dobrinov\/me\/edit\/HEAD\/posts\/hello-blogging\.md/);

  assert.match(await readFile(join(out, 'llms.txt'), 'utf8'), /\(https:\/\/dobrinov\.github\.io\/me\/cv\.md\)/);
  assert.match(await readFile(join(out, 'cv.md'), 'utf8'), /## Signature work/);
  assert.equal(JSON.parse(await readFile(join(out, 'me.json'), 'utf8')).meta.me.repo, 'https://github.com/dobrinov/me');
  assert.match(await readFile(join(out, 'feed.xml'), 'utf8'), /<pubDate>Thu, 29 Oct 2026/);
});

test('builds the template, a minimal file and a legacy file', async () => {
  const out = await mkdtemp(join(tmpdir(), 'me-'));
  await build({ src: join(ROOT, 'template'), out, builtAt, log: quiet });
  assert.match(await readFile(join(out, 'index.html'), 'utf8'), /class="col ai"/);

  const src = await mkdtemp(join(tmpdir(), 'me-src-'));
  await writeFile(join(src, 'me.json'), JSON.stringify({ basics: { name: 'Ada' } }));
  await build({ src, out: join(src, '_site'), builtAt, log: quiet });
  const html = await readFile(join(src, '_site/index.html'), 'utf8');
  assert.match(html, /<h1 class="headline">Ada<\/h1>/);
  assert.doesNotMatch(html, /undefined/);

  const legacy = await mkdtemp(join(tmpdir(), 'me-old-'));
  await mkdir(join(legacy, 'posts'));
  await writeFile(join(legacy, 'me.json'), await readFile(join(ROOT, 'test/legacy-me.json')));
  await writeFile(join(legacy, 'posts/draft.md'), '---\ntitle: Hidden\ndraft: true\n---\nx');
  const r = await build({ src: legacy, out: join(legacy, '_site'), builtAt, log: quiet });
  assert.equal(r.posts, 0);
});

test('publishes images, assets/, static/ and CNAME, and nothing else from the repo', async () => {
  const src = await mkdtemp(join(tmpdir(), 'me-files-'));
  await writeFile(join(src, 'me.json'), JSON.stringify({ basics: { name: 'Ada' } }));
  await mkdir(join(src, 'static'));
  await mkdir(join(src, 'private'));
  for (const f of ['CNAME', 'me.png', 'static/cv.pdf', 'notes.txt', 'private/plan.pdf']) await writeFile(join(src, f), 'x');
  await build({ src, out: join(src, '_site'), builtAt, log: quiet });
  for (const f of ['CNAME', 'me.png', 'static/cv.pdf']) await readFile(join(src, '_site', f));
  for (const f of ['notes.txt', 'private/plan.pdf']) await assert.rejects(readFile(join(src, '_site', f)));
});

test('contact links, and unsafe URLs are dropped', async () => {
  const { renderProfile } = await import('../src/render.mjs');
  const { cvMarkdown } = await import('../src/outputs.mjs');
  const me = { basics: { name: 'Ada', email: 'ada@example.com', url: 'ada.dev', profiles: [
    { network: 'GitHub', url: 'https://github.com/ada' },
    { network: 'Evil', url: 'javascript:alert(1)' }
  ] }, projects: [{ name: 'X', url: 'javascript:alert(1)', startDate: '2020-01' }] };
  const html = renderProfile(me, [], { builtAt });
  assert.match(html, /<a class="mail" href="mailto:ada@example.com" data-tip="ada@example.com">.*?<span class="screen">Email<\/span><span class="print">ada@example.com<\/span><\/a>/);
  assert.match(html, /<a class="icon" href="https:\/\/ada.dev" rel="me" aria-label="Website" data-tip="ada.dev">/);
  assert.match(html, /<a class="icon" href="https:\/\/github.com\/ada" rel="me" aria-label="GitHub" data-tip="github.com\/ada">/);
  assert.doesNotMatch(html, /javascript:/);
  assert.match(cvMarkdown(me, []), /Contact: ada@example.com · ada.dev · GitHub: https:\/\/github.com\/ada/);
});

test('the current employer in the label links to its site', async () => {
  const { renderProfile } = await import('../src/render.mjs');
  const me = { basics: { name: 'Ada', label: 'Team lead at Dext' }, work: [
    { name: 'Dext', url: 'https://www.dext.com/', position: 'Team lead', startDate: '2016-05' },
    { name: 'Acme', url: 'https://acme.test', position: 'Engineer', startDate: '2010-01', endDate: '2016-04' }
  ] };
  assert.match(renderProfile(me, [], { builtAt }), /<div class="meta">Team lead at <a href="https:\/\/www.dext.com\/">Dext<\/a><\/div>/);
  me.work[0].endDate = '2020-01';
  assert.match(renderProfile(me, [], { builtAt }), /<div class="meta">Team lead at Dext<\/div>/);
});

test('How I use LLMs: patterns render with their example, share and the prompt link', async () => {
  const { renderProfile } = await import('../src/render.mjs');
  const { cvMarkdown } = await import('../src/outputs.mjs');
  const me = { basics: { name: 'Ada' }, llms: { source: '100 prompts', gap: 'Rarely says what done looks like.', patterns: [
    { name: 'Plan before code', goal: 'planning', how: 'I ask for a plan first.', achieves: 'Fewer rewrites.', example: 'Plan it, no code yet', share: 31, limit: 'Slow on small fixes.' },
    { name: 'Ask why', goal: 'reviewing', how: 'I question changes.' }
  ] } };
  const html = renderProfile(me, [], { builtAt });
  assert.match(html, /<h2 class="eyebrow" id="llms">How I use LLMs<\/h2>/);
  assert.match(html, /<div class="llm-row"><span class="llm-goal">Planning<\/span><span class="llm-chips"><button type="button" class="llm-chip" popovertarget="llm-1">Plan before code<\/button>/);
  assert.match(html, /<div class="pop llm-pop" id="llm-1" popover>/);
  assert.match(html, /<div class="pop-item"><span class="t">What it achieves<\/span><p>Fewer rewrites\.<\/p><\/div>/);
  assert.match(html, /<blockquote>“Plan it, no code yet”<\/blockquote>/);
  assert.match(html, /Planning · 31% of my prompts/);
  assert.ok(html.indexOf('>Planning<') < html.indexOf('>Reviewing<'));
  assert.match(html, /href="https:\/\/dobrinov.github.io\/jsonme\/patterns-prompt.md"/);
  assert.match(cvMarkdown(me, []), /## How I use LLMs[\s\S]*\*\*Plan before code\*\* \(planning\): I ask for a plan first\. Achieves: Fewer rewrites\. In 31% of prompts\./);
  assert.doesNotMatch(renderProfile({ basics: { name: 'Ada' } }, [], { builtAt }), /id="llms"/);
});

test('a CV without any AI story says nothing about AI', async () => {
  const { renderProfile } = await import('../src/render.mjs');
  const me = { basics: { name: 'Ada' }, work: [{ name: 'Acme', position: 'Engineer', startDate: '2010-01' }], projects: [{ name: 'Tool', startDate: '2015-01', endDate: '2016-01' }] };
  const html = renderProfile(me, [], { builtAt });
  assert.doesNotMatch(html, /AI era|before AI|era-key/);
  me.projects[0].vibecoded = true;
  assert.match(renderProfile(me, [], { builtAt }), /AI era/);
});

test('Open Graph tags make shared links show a card', async () => {
  const { renderProfile, renderPost } = await import('../src/render.mjs');
  const me = { basics: { name: 'Ada', label: 'Engineer', image: 'avatar.jpg' }, headline: 'I make things fast.' };
  const html = renderProfile(me, [], { siteUrl: 'https://ada.dev/', builtAt });
  assert.match(html, /<meta property="og:type" content="profile">/);
  assert.match(html, /<meta property="og:title" content="Ada · Engineer">/);
  assert.match(html, /<meta property="og:description" content="I make things fast.">/);
  assert.match(html, /<meta property="og:url" content="https:\/\/ada.dev\/">/);
  assert.match(html, /<meta property="og:image" content="https:\/\/ada.dev\/avatar.jpg">/);
  assert.match(html, /<meta name="twitter:card" content="summary">/);
  assert.match(html, /<meta property="og:image:alt" content="Ada">/);
  assert.match(html, /<meta name="twitter:image" content="https:\/\/ada.dev\/avatar.jpg">/);
  const post = renderPost(me, { title: 'Hello', summary: 'First post', slug: 'hello', date: '2026-01-02', words: 10, tags: [], body: 'Hi', file: 'hello.md' }, { siteUrl: 'https://ada.dev/', builtAt });
  assert.match(post, /<meta property="og:type" content="article">/);
  assert.match(post, /<meta property="og:url" content="https:\/\/ada.dev\/posts\/hello\/">/);
  assert.match(post, /<meta property="article:published_time" content="2026-01-02">/);
  assert.doesNotMatch(renderProfile(me, [], { builtAt }), /og:image|og:url/, 'no site url, no relative og:image or og:url');
});

test('Plausible analytics from meta.me.plausible, https only', async () => {
  const { renderProfile } = await import('../src/render.mjs');
  const me = { basics: { name: 'Ada' }, meta: { me: { plausible: 'https://stats.example.com/js/pa-abc.js' } } };
  const html = renderProfile(me, [], { builtAt });
  assert.match(html, /<script async src="https:\/\/stats.example.com\/js\/pa-abc.js"><\/script>\n<script>window.plausible=/);
  me.meta.me.plausible = 'javascript:alert(1)';
  assert.doesNotMatch(renderProfile(me, [], { builtAt }), /plausible/);
});

test('ongoing products always reach the present, finished short ones are dots', async () => {
  const { renderProfile } = await import('../src/render.mjs');
  const me = { basics: { name: 'Ada' }, projects: [
    { name: 'Fresh', startDate: '2026-10', vibecoded: true },
    { name: 'Revived', startDate: '2024-01', pausedDate: '2024-06', revivedDate: '2026-09' },
    { name: 'Done', startDate: '2026-03', endDate: '2026-04' }
  ] };
  const html = renderProfile(me, [], { builtAt });
  assert.match(html, /class="seg product ai mono[^"]*" type="button" popovertarget="product-fresh"[^>]*max\(/);
  assert.match(html, /class="seg product ai mono[^"]*" type="button" popovertarget="product-revived" data-role="1"/);
  assert.match(html, /class="dot product mono[^"]*" type="button" popovertarget="product-done"/);
});

test('rejects an invalid me.json', async () => {
  const src = await mkdtemp(join(tmpdir(), 'me-bad-'));
  await writeFile(join(src, 'me.json'), JSON.stringify({ basics: {} }));
  await assert.rejects(build({ src, out: join(src, '_site'), log: quiet }), /1 error/);
});

test('draws roles at one employer as steps when their dates differ', async () => {
  const { renderProfile } = await import('../src/render.mjs');
  const me = { basics: { name: 'Ada' }, work: [
    { name: 'Acme', position: 'Lead', startDate: '2020-01' },
    { name: 'Acme', position: 'Engineer', startDate: '2016-01' }
  ] };
  const html = renderProfile(me, [], { builtAt });
  assert.match(html, /class="seg job r1"[^>]*data-role="1"[^>]*data-tip="Engineer · Jan 2016 – Jan 2020 · 4y"/);
  assert.match(html, /class="seg job r2"[^>]*data-role="0"/);
  assert.match(html, /<span class="s">Engineer → Lead<\/span>/);
});

test('a change of scope under the same title is one bar and a step in the growth path', async () => {
  const { renderProfile } = await import('../src/render.mjs');
  const me = { basics: { name: 'Ada' }, work: [
    { name: 'Acme', position: 'Lead', scope: 'Reports to the CTO', startDate: '2022-01', highlights: ['Design library'] },
    { name: 'Acme', position: 'Lead', startDate: '2019-01' },
    { name: 'Acme', position: 'Engineer', startDate: '2016-01' }
  ], highlights: [
    { title: 'The rewrite', where: 'Acme', when: 'Reports to the CTO', problem: 'p', did: 'd', outcome: 'o' },
    { title: 'The parser', where: 'Acme', when: 'Lead', problem: 'p', did: 'd', outcome: 'o' }
  ] };
  const html = renderProfile(me, [], { builtAt });
  assert.equal(html.match(/class="seg job/g).length, 2);
  assert.match(html, /class="seg job r2"[^>]*data-tip="Lead · Jan 2019 – now/);
  assert.match(html, /<span class="s">Engineer → Lead<\/span>/);
  assert.match(html, /<ol class="growth"><li class="step" data-item="2">.*Engineer.*<li class="step now" data-item="0"><div class="step-head"><span class="t">Reports to the CTO<span class="was">Lead<\/span>/s);
  assert.match(html, /<li class="step" data-item="1">.*<li>The parser · <a href="#s2">Story →<\/a><\/li><\/ul><\/li><li class="step now"/s);
  assert.match(html, /<li>The rewrite · <a href="#s1">Story →<\/a><\/li><\/ul><\/li><\/ol>/);
});

test('a product built by hand and revived with AI', async () => {
  const { renderProfile } = await import('../src/render.mjs');
  const me = { basics: { name: 'Ada' }, projects: [
    { name: 'Kit', url: 'kit.dev', startDate: '2021-01', pausedDate: '2022-01', revivedDate: '2026-01', revival: 'Rebuilt it.' }
  ] };
  const html = renderProfile(me, [], { builtAt });
  assert.match(html, /data-tip="Built by hand · Jan 2021 – Jan 2022 · 1y"/);
  assert.match(html, /<span class="paused" style="left:[\d.]+%;width:[\d.]+%"/);
  assert.match(html, /class="seg product ai mono"[^>]*data-tip="Revived with AI · Jan 2026 – now · 9m"/);
  assert.match(html, /<button class="revival[^"]*" type="button" popovertarget="product-kit"/);
  assert.match(html, /<span class="s">By hand 2021 · revived with AI 2026<\/span>/);
  assert.doesNotMatch(html.slice(html.indexOf('class="pops"'), html.indexOf('</section>', html.indexOf('class="pops"'))), /<a (class="[^"]*" )?href="(?!#)[^"]*">/);
  assert.match(html, /<a href="https:\/\/kit.dev" target="_blank" rel="noopener">Kit<\/a>/);
  assert.match(html, /Revived with AI<\/span><span class="period">Jan 2026 – now · 9m<\/span><\/div><p>Rebuilt it.<\/p>/);
});

test('a vibe-coded product', async () => {
  const { renderProfile } = await import('../src/render.mjs');
  const { cvMarkdown } = await import('../src/outputs.mjs');
  const me = { basics: { name: 'Ada' }, projects: [
    { name: 'New', startDate: '2026-09', vibecoded: true },
    { name: 'Old', startDate: '2025-01', vibecoded: true }
  ] };
  const html = renderProfile(me, [], { builtAt });
  assert.match(html, /<button class="revival[^"]*" type="button" popovertarget="product-new" data-tip="Vibe-coded · Sep 2026 – now · 1m"/);
  assert.match(html, /class="seg product ai mono"[^>]*popovertarget="product-old"/);
  assert.match(html, /<span class="s">Vibe-coded · 1y 9m<\/span>/);
  assert.match(html, /<\/svg><\/span>Vibe-coded<\/span><span><i class="era-key">/, 'the legend explains the star');
  assert.match(cvMarkdown(me, []), /\*\*New\*\* \([^)]*, vibe-coded\)/);
});
