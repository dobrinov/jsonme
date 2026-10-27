# {me}

A CV and blog for software developers, kept as `me.json` and Markdown in your own repo and published as a static site by a GitHub Action (or GitLab CI). No server, no account.

The CV is built to show what can't be generated: engineering depth from before AI next to how you work with AI now, three signature stories with proof, and a career line. It opens as an overview and lets readers drill down.

## Layout

| Path | What it is |
| --- | --- |
| `src/build.mjs` | The builder. Node 20+, no dependencies. |
| `schema/v1.json` | JSON Schema for `me.json` (editor autocomplete). |
| `action/action.yml` | Composite Action: `uses: dobrinov/jsonme/me/action@main`. |
| `template/` | Contents of the template repo people start from. |
| `examples/dobrinov/` | A real CV converted from the old jsonme format. |

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

The career line has one row per employer (`work` entries with the same `name`), product (`projects`) and school (`education`). Hover shows dates, click opens the details. Several roles at one employer are drawn as steps when each has its own `startDate`; with equal start dates they share one bar. A story in `highlights` is linked from a role when its `where` is the employer and its `when` is the position, and from a product when its title contains the product name.

Only `basics.name` is required. Old jsonme files (`employments`, `technologies`, …) are converted automatically during the build.

Posts are `posts/*.md` with frontmatter: `title`, `date`, `summary`, `tags`, `draft`.
