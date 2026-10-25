# me

My CV and blog, published with [{me}](https://github.com/dobrinov/jsonme/tree/main/me).

- `me.json` is the CV. Your editor autocompletes it from the `$schema` link.
- `posts/*.md` are blog posts.
- Every push to `main` rebuilds the site. GitHub: **Settings → Pages → Source: GitHub Actions** (the first run turns this on for you).

Check the file locally without publishing:

```sh
git clone --depth 1 https://github.com/dobrinov/jsonme.git /tmp/me
node /tmp/me/me/src/build.mjs --check              # validate me.json
node /tmp/me/me/src/build.mjs --out _site          # build, then open _site/index.html
```
