# me

My CV and blog, published with [{me}](https://github.com/dobrinov/jsonme/tree/main/me).

- `me.json` is the CV. To write it with AI from your LinkedIn PDF or an old CV, and preview it before you push, use https://dobrinov.github.io/jsonme/write/. Your editor also autocompletes it from the `$schema` link.
- `posts/*.md` are blog posts.
- Images and anything in `assets/` or `static/` are published with it; other files in the repo are not.
- Every push to `main` rebuilds the site. GitHub: **Settings → Pages → Source: GitHub Actions** (the first run turns this on for you).

Check the file locally without publishing:

```sh
git clone --depth 1 --branch v1 https://github.com/dobrinov/jsonme.git /tmp/me
node /tmp/me/me/src/build.mjs --check              # validate me.json
node /tmp/me/me/src/build.mjs --out _site          # build, then open _site/index.html
```
