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
  assert.doesNotMatch(index, /class="col ai"/, 'empty AI column is not rendered');

  const post = await readFile(join(out, 'posts/hello-blogging/index.html'), 'utf8');
  assert.match(post, /<h1>Hello, blogging!<\/h1>/);
  assert.match(post, /<h2>How does it work\?<\/h2>/);
  assert.match(post, /github\.com\/dobrinov\/me\/edit\/HEAD\/posts\/hello-blogging\.md/);

  assert.match(await readFile(join(out, 'llms.txt'), 'utf8'), /\(https:\/\/dobrinov\.github\.io\/me\/cv\.md\)/);
  assert.match(await readFile(join(out, 'cv.md'), 'utf8'), /## Signature work/);
  assert.equal(JSON.parse(await readFile(join(out, 'me.json'), 'utf8')).meta.me.repo, 'https://github.com/dobrinov/me');
  assert.match(await readFile(join(out, 'feed.xml'), 'utf8'), /<pubDate>Sat, 03 Dec 2022/);
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
    { name: 'Kit', startDate: '2021-01', pausedDate: '2022-01', revivedDate: '2026-01', revival: 'Rebuilt it.' }
  ] };
  const html = renderProfile(me, [], { builtAt });
  assert.match(html, /data-tip="Built by hand · Jan 2021 – Jan 2022 · 1y"/);
  assert.match(html, /<span class="paused" style="left:[\d.]+%;width:[\d.]+%"/);
  assert.match(html, /class="seg product ai mono"[^>]*data-tip="Revived with AI · Jan 2026 – now · 9m"/);
  assert.match(html, /<button class="revival[^"]*" type="button" popovertarget="product-kit"/);
  assert.match(html, /<span class="s">By hand 2021 · revived with AI 2026<\/span>/);
  assert.match(html, /Revived with AI<\/span><span class="period">Jan 2026 – now · 9m<\/span><\/div><p>Rebuilt it.<\/p>/);
});
