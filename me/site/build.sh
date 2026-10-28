#!/bin/sh
# Assembles the project page: everything in site/ plus the builder modules that /write/ runs in the browser.
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
echo "Built $out"
