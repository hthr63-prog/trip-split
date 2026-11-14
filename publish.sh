#!/bin/sh
# Stamp a new version so open copies (including the home-screen app) reload themselves.
set -e
cd "$(dirname "$0")"
V=$(date -u +%Y%m%d%H%M%S)
sed -i -E "s/name=\"app-v\" content=\"[^\"]*\"/name=\"app-v\" content=\"$V\"/; s/(config|app|fx|theme|motion)\.js\?v=[^\"]*/\1.js?v=$V/g" index.html
printf '{"v":"%s"}\n' "$V" > version.json
echo "$V"
