#!/bin/sh
# Stamp a new version so open copies (including the home-screen app) reload themselves.
set -e
cd "$(dirname "$0")"
V=$(date -u +%Y%m%d%H%M%S)
sed -i -E "s/APP_V=\"[^\"]*\"/APP_V=\"$V\"/; s/(config|app|fx)\.js\?v=[^\"]*/\1.js?v=$V/g" index.html
printf '{"v":"%s"}\n' "$V" > version.json
echo "$V"
