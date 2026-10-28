---
title: "How to blog with {me}"
date: 2026-10-29
summary: "Write a Markdown file, push it, and it's a post: front matter, formatting, images, drafts and where your posts show up."
tags: [me, tutorial, markdown]
---

You are reading a post written in one Markdown file: [posts/hello-blogging.md](https://github.com/dobrinov/me/blob/main/posts/hello-blogging.md) in my [me repository](https://github.com/dobrinov/me). There is no CMS, database or admin panel. You write a file, push it, and a GitHub Action turns it into this page. This tutorial shows everything the blog engine in [{me}](https://dobrinov.github.io/jsonme/) can do, and it uses each feature as it goes.

## Before you start

You need a {me} site: a repository with your `me.json` and the publish workflow. If you don't have one yet, the [project page](https://dobrinov.github.io/jsonme/#start) gets you there in three steps, and the [write page](https://dobrinov.github.io/jsonme/write/) helps you write `me.json` with the AI you already use.

## Your first post in three steps

1. Create a `posts` folder next to `me.json`.
2. Add a Markdown file to it. The file name becomes the address: `posts/hello-world.md` is published at `/posts/hello-world/`.
3. Commit and push. The site rebuilds in about a minute.

```markdown
---
title: "Hello, world"
date: 2026-10-29
---

My first post.
```

That is a complete post. Everything else is optional.

## Front matter

The block between the two `---` lines tells {me} about the post. These are all the fields it reads:

| Field | What it does |
| --- | --- |
| `title` | The headline. Without it, the file name is used. |
| `date` | `YYYY-MM-DD`. Posts are listed newest first, and the date shows above the title. |
| `summary` | One or two sentences. Used in the RSS feed, search results, link previews and `llms.txt`. |
| `tags` | A list, like `[rails, payments]`. Shown as chips under the title. |
| `draft` | `true` keeps the post off the site until you remove it. |

This post's front matter is:

```markdown
---
title: "How to blog with {me}"
date: 2026-10-29
summary: "Write a Markdown file, push it, and it's a post: front matter, formatting, images, drafts and where your posts show up."
tags: [me, tutorial, markdown]
---
```

## Writing

Posts use the parts of GitHub-flavoured Markdown that a technical post needs:

- **Bold**, *italic*, ~~strikethrough~~ and `inline code`
- [Links](https://dobrinov.github.io/jsonme/), and bare addresses in angle brackets: <https://github.com/dobrinov/me>
- Numbered and bulleted lists
- Headings: start at `##`, because the title is the page's only top heading
- Quotes, tables, horizontal rules and fenced code blocks

> A quote looks like this. Use it for a pull quote, or for what someone else said.

Code blocks take a language name after the opening fence, so readers and tools know what they are looking at:

```ruby
def reading_time(words)
  [1, (words / 220.0).round].max
end
```

That function is roughly how the "min read" at the top of this page is calculated.

---

Raw HTML is shown as text, not run. A post can't break the page or load scripts.

## Images

Put the image anywhere in your repository and link to it relative to the post's address. A post lives at `/posts/<name>/`, so an image in `posts/images/` is one folder up:

```markdown
![The career timeline on my CV](../images/timeline.png)
```

Images are the only files besides `me.json` and posts that {me} publishes, together with anything under `assets/` or `static/`. Notes, drafts and PDFs in your repository stay private.

## Drafts

Add `draft: true` to the front matter and push as often as you like. The post isn't published until you remove the line. To preview a draft, change it to `draft: false` and build the site on your machine without pushing:

```sh
node /tmp/jsonme/me/src/build.mjs --out _site   # then open _site/posts/<name>/index.html
```

## Where your posts show up

One file reaches readers in several places:

| Where | What readers get |
| --- | --- |
| The post page | Title, date, reading time, tags and the post itself, in light and dark themes |
| Your CV | A **Writing** row under "More, if you're curious", with your latest post |
| `feed.xml` | An RSS feed of your 20 newest posts |
| Link previews | A card with the title, summary and your photo when someone shares the link |
| `llms.txt` and `cv.md` | Your posts listed for AI agents that read your site |

If you set `meta.me.repo` in `me.json` to your repository's address, every post also gets a **Suggest an edit** link that opens the file on GitHub.

## Checklist for a good post

1. A title that says what the reader gets.
2. A `summary`, because link previews and feed readers show it first.
3. Headings every few paragraphs, so readers can skim.
4. Code that runs, with the language after the fence.
5. A date, so readers know how fresh it is.

Write your first post, push it, and it is live. This one took one file and one `git push`.
