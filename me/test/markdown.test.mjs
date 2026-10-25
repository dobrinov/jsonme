import { test } from 'node:test';
import assert from 'node:assert/strict';
import { markdown, inline } from '../src/markdown.mjs';
import { parseFrontmatter } from '../src/frontmatter.mjs';

test('escapes raw HTML and unsafe links', () => {
  assert.equal(inline('<script>x</script>'), '&lt;script&gt;x&lt;/script&gt;');
  assert.match(inline('[a](javascript:alert(1))'), /href="#"/);
});

test('inline formatting', () => {
  assert.equal(inline('**b** and *i* and `c*d*`'), '<strong>b</strong> and <em>i</em> and <code>c*d*</code>');
  assert.equal(inline('[x](https://a.b)'), '<a href="https://a.b">x</a>');
  assert.equal(inline('snake_case_name'), 'snake_case_name');
});

test('headings shift and fenced code is escaped', () => {
  const html = markdown('# Top\n\n```json\n{"a": "<b>"}\n```', { shift: 1 });
  assert.match(html, /<h2>Top<\/h2>/);
  assert.match(html, /<pre><code class="language-json">\{&quot;a&quot;: &quot;&lt;b&gt;&quot;\}<\/code><\/pre>/);
});

test('ordered list keeps numbering after a code block', () => {
  const html = markdown('1. one\n2. two\n```\ncode\n```\n\n3. three');
  assert.match(html, /<ol><li>one<\/li><li>two<\/li><\/ol>/);
  assert.match(html, /<ol start="3"><li>three<\/li><\/ol>/);
});

test('tables and blockquotes', () => {
  assert.match(markdown('| a | b |\n|---|---|\n| 1 | 2 |'), /<th>a<\/th><th>b<\/th>.*<td>1<\/td><td>2<\/td>/);
  assert.match(markdown('> quoted'), /<blockquote><p>quoted<\/p><\/blockquote>/);
});

test('frontmatter', () => {
  const { data, body } = parseFrontmatter('---\ntitle:  "Hello, blogging!"\ndate: 2022-12-03\ntags: [a, b]\ndraft: false\n---\nBody');
  assert.deepEqual(data, { title: 'Hello, blogging!', date: '2022-12-03', tags: ['a', 'b'], draft: false });
  assert.equal(body, 'Body');
  assert.deepEqual(parseFrontmatter('no frontmatter').data, {});
});
