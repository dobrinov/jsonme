#!/bin/sh
# Assembles the project page: everything in site/, the builder modules that /write/ runs in the browser,
# and the John Doe example CV built by the real builder at /example/.
#   sh me/site/build.sh [out]   (default: me/_pages)
set -e
cd "$(dirname "$0")/.."
out=${1:-_pages}
rm -rf "$out"
mkdir -p "$out/lib"
cp -R site/. "$out/"
rm "$out/build.sh"
cp src/render.mjs src/validate.mjs src/markdown.mjs src/migrate.mjs src/theme.css src/me.js "$out/lib/"
cp template/me.json "$out/lib/template.json"
# /write/ previews in an iframe, where a relative image path would not resolve.
sed 's#"image": "avatar.jpg"#"image": "https://dobrinov.github.io/jsonme/example/avatar.jpg"#' examples/john-doe/me.json > "$out/lib/example.json"
node src/build.mjs --src examples/john-doe --out "$out/example" --site-url https://dobrinov.github.io/jsonme/example >/dev/null
# sitemap.xml: every page the build produced, as a directory URL.
base=https://dobrinov.github.io/jsonme/
today=$(date -u +%Y-%m-%d)
{
  echo '<?xml version="1.0" encoding="UTF-8"?>'
  echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  (cd "$out" && find . -name index.html -not -path './lib/*' | sed 's#^\./##; s#index\.html$##' | sort) | while read -r path; do
    echo "  <url><loc>$base$path</loc><lastmod>$today</lastmod></url>"
  done
  echo '</urlset>'
} > "$out/sitemap.xml"
echo "Built $out"
