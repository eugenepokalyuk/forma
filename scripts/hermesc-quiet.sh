#!/usr/bin/env bash
# hermesc без предупреждений (-w) — для iOS-сборки (ios/.xcode.env).
# Предупреждения Hermes в бандле — ложные: «переменная не объявлена» про
# глобальные Promise, fetch, setTimeout и т.п., которые среда даёт сама.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec "$ROOT/node_modules/hermes-compiler/hermesc/osx-bin/hermesc" -w "$@"
