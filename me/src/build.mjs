#!/usr/bin/env node
// Builds a {me} site from a repo: me.json + posts/*.md -> static files.
//
//   node build.mjs [--src .] [--out _site] [--site-url https://you.github.io/me/] [--repo https://github.com/you/me] [--check]
//   node build.mjs --migrate old-me.json > me.json

import { readFile, writeFile, mkdir, readdir, copyFile, rm, stat } from 'node:fs/promises';
import { join, dirname, relative, extname, basename, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from './frontmatter.mjs';
import { plainText } from './markdown.mjs';
import { validate } from './validate.mjs';
import { migrate, isLegacy } from './migrate.mjs';
import { renderProfile, renderPost } from './render.mjs';
import { cvMarkdown, llmsTxt, feedXml } from './outputs.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SKIP = new Set(['me.json', 'README.md', 'LICENSE', 'LICENSE.md', 'node_modules']);

function args(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    out[key] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
  }
  return out;
}

const withSlash = (url) => (url ? url.replace(/\/?$/, '/') : '');

export async function loadPosts(src) {
  const dir = join(src, 'posts');
  let files = [];
  try { files = (await readdir(dir)).filter((f) => f.endsWith('.md')); } catch { return []; }
  const posts = [];
  for (const file of files) {
    const raw = await readFile(join(dir, file), 'utf8');
    const { data, body } = parseFrontmatter(raw);
    if (data.draft === true) continue;
    const text = plainText(body);
    const outside = body.replace(/```[\s\S]*?```/g, '');
    posts.push({
      file,
      slug: basename(file, '.md'),
      title: String(data.title || basename(file, '.md')),
      date: data.date ? String(data.date).slice(0, 10) : '',
      summary: data.summary ? String(data.summary) : '',
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      body,
      words: text ? text.split(' ').length : 0,
      topHeading: /^#\s/m.test(outside) ? 1 : 0
    });
  }
  return posts.sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.title.localeCompare(b.title));
}

async function copyStatic(src, out, dir = src) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const from = join(dir, entry.name);
    if (entry.name.startsWith('.') || SKIP.has(entry.name) || resolve(from) === resolve(out)) continue;
    if (entry.isDirectory()) await copyStatic(src, out, from);
    else if (extname(entry.name) !== '.md') {
      const to = join(out, relative(src, from));
      await mkdir(dirname(to), { recursive: true });
      await copyFile(from, to);
    }
  }
}

async function write(out, path, content) {
  const to = join(out, ...path.split('/'));
  await mkdir(dirname(to), { recursive: true });
  await writeFile(to, content);
}

export async function build({ src = '.', out = '_site', siteUrl = '', repo = '', builtAt = new Date(), log = console } = {}) {
  let me = JSON.parse(await readFile(join(src, 'me.json'), 'utf8'));
  if (isLegacy(me)) {
    log.warn('warning: me.json uses the old jsonme format; converting it. Run `build.mjs --migrate me.json` to update the file.');
    me = migrate(me);
  }

  const { errors, warnings } = validate(me);
  for (const w of warnings) log.warn(`warning: ${w}`);
  if (errors.length) {
    for (const err of errors) log.error(`error: ${err}`);
    throw new Error(`me.json has ${errors.length} error${errors.length > 1 ? 's' : ''}`);
  }

  siteUrl = withSlash(siteUrl);
  if (repo) me = { ...me, meta: { ...me.meta, me: { ...(me.meta && me.meta.me), repo } } };
  const posts = await loadPosts(src);
  const opts = { siteUrl, builtAt };

  if (resolve(out) === resolve(src) || resolve(src).startsWith(resolve(out) + sep)) throw new Error('--out must not contain the source');
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  await copyStatic(src, out);

  await write(out, 'index.html', renderProfile(me, posts, opts));
  for (const post of posts) await write(out, `posts/${post.slug}/index.html`, renderPost(me, post, opts));
  await write(out, 'me.json', JSON.stringify(me, null, 2) + '\n');
  await write(out, 'cv.md', cvMarkdown(me, posts, opts));
  await write(out, 'llms.txt', llmsTxt(me, posts, opts));
  await write(out, 'feed.xml', feedXml(me, posts, opts));
  await write(out, '.nojekyll', '');
  await write(out, 'assets/me.css', await readFile(join(HERE, 'theme.css')));
  await write(out, 'assets/me.js', await readFile(join(HERE, 'me.js')));

  return { posts: posts.length, warnings: warnings.length };
}

async function main() {
  const a = args(process.argv.slice(2));

  if (a.migrate) {
    const old = JSON.parse(await readFile(a.migrate, 'utf8'));
    process.stdout.write(JSON.stringify(migrate(old), null, 2) + '\n');
    return;
  }

  const src = a.src || '.';
  if (a.check) {
    let me = JSON.parse(await readFile(join(src, 'me.json'), 'utf8'));
    if (isLegacy(me)) me = migrate(me);
    const { errors, warnings } = validate(me);
    warnings.forEach((w) => console.warn(`warning: ${w}`));
    errors.forEach((err) => console.error(`error: ${err}`));
    console.log(errors.length ? `✗ ${errors.length} error(s)` : '✓ me.json is valid');
    process.exitCode = errors.length ? 1 : 0;
    return;
  }

  const out = a.out || '_site';
  const result = await build({ src, out, siteUrl: a['site-url'] || process.env.ME_SITE_URL || '', repo: a.repo || process.env.ME_REPO_URL || '' });
  const size = (await stat(join(out, 'index.html'))).size;
  console.log(`✓ Built ${out}/ · CV (${Math.round(size / 1024)} KB), ${result.posts} post${result.posts === 1 ? '' : 's'}, cv.md, llms.txt, feed.xml`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  });
}
