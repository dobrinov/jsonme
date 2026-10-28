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
cp examples/john-doe/me.json "$out/lib/example.json"
node src/build.mjs --src examples/john-doe --out "$out/example" --site-url https://dobrinov.github.io/jsonme/example >/dev/null
echo "Built $out"
