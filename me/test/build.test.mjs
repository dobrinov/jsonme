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
  assert.match(index, /href="#job-dext"/);
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
