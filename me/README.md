# {me}

A CV and blog for software developers, kept as `me.json` and Markdown in your own repo and published as a static site by a GitHub Action (or GitLab CI). No server, no account.

The CV is built to show what can't be generated: engineering depth from before AI next to how you work with AI now, three signature stories with proof, and a career line. It opens as an overview and lets readers drill down.

## Layout

| Path | What it is |
| --- | --- |
| `src/build.mjs` | The builder. Node 20+, no dependencies. |
| `schema/v1.json` | JSON Schema for `me.json` (editor autocomplete). |
| `action/action.yml` | Composite Action: `uses: dobrinov/jsonme/me/action@v1`. The `v1` tag moves with fixes and compatible changes; a breaking change gets `v2`. |
| `template/` | Contents of the template repo people start from. |
| `examples/john-doe/` | A fictional CV that uses every feature. It is the example on the project page, at `/example/`. |
| `examples/dobrinov/` | A real CV converted from the old jsonme format. |
| `site/` | The project page at https://dobrinov.github.io/jsonme/: `write/` turns a LinkedIn PDF into `me.json` with the reader's own AI (`prompt.md`) and checks and previews it in the browser with the builder's own modules. `sh site/build.sh` assembles it; `.github/workflows/pages.yml` publishes it. |

## Use

```sh
node src/build.mjs --src examples/dobrinov --out _site --site-url https://dobrinov.github.io/me
node src/build.mjs --src path/to/me --check      # validate only
node src/build.mjs --migrate old-me.json         # convert an old jsonme file, prints the new one
npm test
```

Output: `index.html` (CV), `posts/<slug>/index.html`, `me.json`, `cv.md` and `llms.txt` for AI agents, `feed.xml`. The site has light and dark themes: it follows the system setting, and a switch in the top bar lets readers pick one (kept in their browser). Printing always uses the light theme and expands every section.

## Format

`me.json` is JSON Resume (`basics`, `work`, `projects`, `education`, `skills`) plus:

- `headline`: one sentence, shown large.
- `facts`: up to 4 `{ value, label }`.
- `expertise.engineering` and `expertise.ai`: `{ name, proof, detail, aiPractice: { delegated, owned, verifiedBy } }`. `proof` is required.
- `highlights`: at most 3 stories `{ title, hook, where, when, tags, problem, did, outcome, stack, evidence }`.
- `meta.me`: `listed`, `lookingFor`, `domains`, `aiEraStart` (default `2023-01`).
- `llms`: how you use LLMs, `{ source, gap, patterns: [{ name, goal, how, achieves, example, share, limit }] }`. Patterns show as one row of names per `goal` (planning, designing, building, reviewing, debugging, research, writing, operating); a click opens the detail. [`site/patterns-prompt.md`](site/patterns-prompt.md) asks an LLM to find them in your own prompts.

Everything about AI is optional. The AI-era line, "N of them before AI" and the AI-native column show only when the CV has AI content: `expertise.ai`, an `ai` story tag, a vibe-coded or revived product, `llms`, or `aiEraStart`.

`basics.email`, `basics.url` and `basics.profiles` show as links under the name and in `cv.md`.

The career line has one row per employer (`work` entries with the same `name`), product (`projects`) and school (`education`). It is a fixed width per year, opens at the present and scrolls back; names stay pinned. Hover shows dates, click opens the details, and links in the details open in a new tab.

- Several roles at one employer open as a growth path, oldest first. On the bar they are drawn as steps when each has its own `startDate`; with equal start dates they share one bar. Roles with the same `position` share a bar either way.
- `work[].scope` names a change under the same title, e.g. `"position": "Team lead", "scope": "Reports to the CTO"`. It is its own step in the growth path.
- A story in `highlights` is listed under the role whose `scope` or `position` equals its `when` (a scope wins), and on a product whose name is in the story's title.
- A product built by hand and picked up again with AI takes `pausedDate`, `revivedDate` and `revival` (what was built since). It is drawn as a bar, a dashed pause and a star where the revival starts.
- A product built with AI from the start takes `"vibecoded": true`. It is drawn with a star where it starts and a hatched bar; the legend explains the star.

Links in `me.json` and posts may be `http(s)`, `mailto` or relative; other schemes are dropped. From the repo, only images, `assets/`, `static/` and `CNAME` are copied to the site, so notes or drafts next to `me.json` stay private.

Only `basics.name` is required. Old jsonme files (`employments`, `technologies`, …) are converted automatically during the build.

Posts are `posts/*.md` with frontmatter: `title`, `date`, `summary`, `tags`, `draft`.
